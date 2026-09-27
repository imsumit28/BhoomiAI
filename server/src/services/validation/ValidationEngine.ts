import {
  LandRecord,
  ValidationIssue,
  ValidationResult,
  IssueSeverity,
  ValidationStatus,
} from '../../../../shared/types';
import { MASTER_HIERARCHY, VALID_LAND_CLASSIFICATIONS } from '../../../../shared/masterData';

export interface ValidationContext {
  existingRecords: LandRecord[];
  allRecordsInVillage?: LandRecord[];
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: IssueSeverity;
  validate(record: LandRecord, context: ValidationContext): ValidationIssue[];
}

/**
 * RULE 1: Survey number consistency
 * If the same survey number appears multiple times with conflicting owner information
 */
export class SurveyNumberConsistencyRule implements ValidationRule {
  id = 'RULE_01_SURVEY_CONSISTENCY';
  name = 'Survey Number Consistency';
  description = 'Detects conflicting owner information for the same survey number in the same revenue village.';
  severity: IssueSeverity = 'critical';

  validate(record: LandRecord, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const village = record.village?.value?.trim().toLowerCase();
    const survey = record.surveyNumber?.value?.trim();
    const owner = record.ownerName?.value?.trim().toLowerCase();

    if (!village || !survey || !owner) return issues;

    const conflicts = context.existingRecords.filter((other) => {
      if (other.recordId === record.recordId) return false;
      const otherVillage = other.village?.value?.trim().toLowerCase();
      const otherSurvey = other.surveyNumber?.value?.trim();
      const otherOwner = other.ownerName?.value?.trim().toLowerCase();

      return (
        otherVillage === village &&
        otherSurvey === survey &&
        otherOwner &&
        !otherOwner.includes(owner) &&
        !owner.includes(otherOwner)
      );
    });

    if (conflicts.length > 0) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        field: 'surveyNumber',
        detectedValue: record.surveyNumber.value,
        expectedCondition: 'Single unambiguous ownership title per parcel or documented joint ownership',
        explanation: `Survey No. ${record.surveyNumber.value} in Village ${record.village.value} is claimed by "${record.ownerName.value}", but previously registered under "${conflicts[0].ownerName.value}" (Record ${conflicts[0].recordId}). Potential title collision detected.`,
        recommendedAction: 'Flag for Title Verification in Human-in-the-Loop queue before mutation update.',
        relatedRecordIds: conflicts.map((c) => c.recordId),
      });
    }

    return issues;
  }
}

/**
 * RULE 2: Area consistency
 * If child/sub-parcel areas exceed parent parcel area
 */
export class AreaConsistencyRule implements ValidationRule {
  id = 'RULE_02_AREA_CONSISTENCY';
  name = 'Sub-parcel Area Consistency';
  description = 'Ensures aggregated sub-parcel (batankan) areas do not exceed parent parcel total area.';
  severity: IssueSeverity = 'critical';

  validate(record: LandRecord, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const survey = record.surveyNumber?.value?.trim();
    const area = Number(record.area?.value);

    if (!survey || isNaN(area) || area <= 0) return issues;

    // Check if this record is a parent or child
    const isSubParcel = survey.includes('/');
    const parentSurvey = isSubParcel ? survey.split('/')[0] : record.parentSurveyNumber;

    if (parentSurvey) {
      const parentRecord = context.existingRecords.find(
        (r) =>
          r.village?.value?.toLowerCase() === record.village?.value?.toLowerCase() &&
          (r.surveyNumber?.value === parentSurvey || r.khasraNumber?.value === parentSurvey)
      );

      if (parentRecord && parentRecord.area?.value) {
        const parentArea = Number(parentRecord.area.value);
        // Find all sibling sub-parcels
        const siblings = context.existingRecords.filter(
          (r) =>
            r.village?.value?.toLowerCase() === record.village?.value?.toLowerCase() &&
            r.surveyNumber?.value?.startsWith(`${parentSurvey}/`)
        );

        const siblingTotal = siblings
          .filter((s) => s.recordId !== record.recordId)
          .reduce((sum, s) => sum + (Number(s.area?.value) || 0), 0);

        const totalCalculated = siblingTotal + area;

        if (totalCalculated > parentArea * 1.01) {
          issues.push({
            ruleId: this.id,
            ruleName: this.name,
            severity: this.severity,
            field: 'area',
            detectedValue: `${totalCalculated.toFixed(2)} ${record.areaUnit?.value || 'Acres'}`,
            expectedCondition: `Total sub-parcels must not exceed parent survey ${parentSurvey} area of ${parentArea} ${record.areaUnit?.value || 'Acres'}`,
            explanation: `The sum of sub-parcels (${siblingTotal.toFixed(2)} + current ${area.toFixed(2)} = ${totalCalculated.toFixed(2)}) exceeds parent parcel ${parentSurvey} (${parentArea} ${record.areaUnit?.value || 'Acres'}). Area inflation detected.`,
            recommendedAction: 'Trigger physical cadastral map resurvey validation or patwari field report.',
            relatedRecordIds: [parentRecord.recordId, ...siblings.map((s) => s.recordId)],
          });
        }
      }
    }

    return issues;
  }
}

/**
 * RULE 3: Duplicate record detection
 * If same village + survey number + khasra number appears multiple times
 */
export class DuplicateRecordRule implements ValidationRule {
  id = 'RULE_03_DUPLICATE_RECORD';
  name = 'Duplicate Record Detection';
  description = 'Detects exact duplicate entries for the same Village, Survey Number, and Khasra Number.';
  severity: IssueSeverity = 'critical';

  validate(record: LandRecord, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const village = record.village?.value?.trim().toLowerCase();
    const survey = record.surveyNumber?.value?.trim();
    const khasra = record.khasraNumber?.value?.trim();

    if (!village || !survey) return issues;

    const duplicates = context.existingRecords.filter((other) => {
      if (other.recordId === record.recordId) return false;
      return (
        other.village?.value?.trim().toLowerCase() === village &&
        other.surveyNumber?.value?.trim() === survey &&
        (other.khasraNumber?.value?.trim() === khasra || (!khasra && !other.khasraNumber?.value))
      );
    });

    if (duplicates.length > 0) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        field: 'khasraNumber',
        detectedValue: `${record.village?.value} | Survey: ${survey} | Khasra: ${khasra || 'N/A'}`,
        expectedCondition: 'Unique land parcel registration per revenue village',
        explanation: `A land record with the same Village, Survey (${survey}) and Khasra already exists under Record ID ${duplicates[0].recordId}.`,
        recommendedAction: 'Merge with existing active record or reject duplicate document scan.',
        relatedRecordIds: duplicates.map((d) => d.recordId),
      });
    }

    return issues;
  }
}

/**
 * RULE 4: Date validation
 * Mutation date cannot be before registration date
 */
export class DateConsistencyRule implements ValidationRule {
  id = 'RULE_04_DATE_CONSISTENCY';
  name = 'Mutation vs Registration Date Consistency';
  description = 'Ensures chronological order: Mutation (नामांतरण) date cannot precede Registration (पंजीकरण) date.';
  severity: IssueSeverity = 'warning';

  validate(record: LandRecord): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const regDateStr = record.registrationDate?.value;
    const mutDateStr = record.mutationDate?.value;

    if (regDateStr && mutDateStr) {
      const regDate = new Date(regDateStr);
      const mutDate = new Date(mutDateStr);

      if (!isNaN(regDate.getTime()) && !isNaN(mutDate.getTime())) {
        if (mutDate < regDate) {
          issues.push({
            ruleId: this.id,
            ruleName: this.name,
            severity: this.severity,
            field: 'mutationDate',
            detectedValue: `Mutation: ${mutDateStr} < Registration: ${regDateStr}`,
            expectedCondition: 'Mutation Date >= Registration Date',
            explanation: `Mutation was recorded on ${mutDateStr} before the deed was registered on ${regDateStr}. Chronological anomaly detected.`,
            recommendedAction: 'Verify original stamp paper and Tehsil mutation order register entries.',
          });
        }
      }
    }

    return issues;
  }
}

/**
 * RULE 5: Area validation
 * Area must be positive and non-zero
 */
export class AreaPositiveRule implements ValidationRule {
  id = 'RULE_05_AREA_POSITIVE';
  name = 'Positive Parcel Area Validation';
  description = 'Validates that the extracted parcel area is a positive, non-zero numeric value.';
  severity: IssueSeverity = 'critical';

  validate(record: LandRecord): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const area = Number(record.area?.value);

    if (isNaN(area) || area <= 0) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        field: 'area',
        detectedValue: record.area?.value,
        expectedCondition: 'Area must be a valid positive number > 0',
        explanation: `Extracted land area value (${record.area?.value}) is invalid or non-positive.`,
        recommendedAction: 'Correct extracted area from scanned document in Verification Queue.',
      });
    }

    return issues;
  }
}

/**
 * RULE 6: Required fields validation
 * Owner name, Survey number, Village, District, Area must not be empty
 */
export class RequiredFieldsRule implements ValidationRule {
  id = 'RULE_06_REQUIRED_FIELDS';
  name = 'Mandatory Land Record Fields';
  description = 'Validates presence of fundamental metadata (Owner Name, Survey Number, Village, District, Area).';
  severity: IssueSeverity = 'critical';

  validate(record: LandRecord): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const requiredChecks = [
      { key: 'ownerName', label: 'Owner Name (भूमि स्वामी)', val: record.ownerName?.value },
      { key: 'surveyNumber', label: 'Survey / Khasra Number (खसरा संख्या)', val: record.surveyNumber?.value },
      { key: 'village', label: 'Village (ग्राम)', val: record.village?.value },
      { key: 'district', label: 'District (जिला)', val: record.district?.value },
      { key: 'area', label: 'Area (क्षेत्रफल)', val: record.area?.value },
    ];

    for (const item of requiredChecks) {
      if (!item.val || String(item.val).trim() === '') {
        issues.push({
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          field: item.key,
          detectedValue: 'Empty / Not Extracted',
          expectedCondition: `${item.label} is required for all legal land records`,
          explanation: `Field "${item.label}" could not be parsed from document scan.`,
          recommendedAction: 'Manual entry required by Verification Officer.',
        });
      }
    }

    return issues;
  }
}

/**
 * RULE 7: Administrative hierarchy validation
 * Village -> Tehsil -> District -> State against master-data
 */
export class AdministrativeHierarchyRule implements ValidationRule {
  id = 'RULE_07_ADMIN_HIERARCHY';
  name = 'Administrative Revenue Hierarchy';
  description = 'Validates Village → Tehsil → District → State nesting against the official Land Revenue Master Table.';
  severity: IssueSeverity = 'warning';

  validate(record: LandRecord): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const stateName = record.state?.value?.trim();
    const districtName = record.district?.value?.trim();
    const tehsilName = record.tehsil?.value?.trim();
    const villageName = record.village?.value?.trim();

    if (!stateName || !districtName) return issues;

    const stateMatch = MASTER_HIERARCHY.find((s) => s.state.toLowerCase() === stateName.toLowerCase());
    if (!stateMatch) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        field: 'state',
        detectedValue: stateName,
        expectedCondition: 'Must exist in National Land Records Registry Master Table',
        explanation: `State "${stateName}" is not registered in the active master hierarchy.`,
        recommendedAction: 'Verify state jurisdiction settings.',
      });
      return issues;
    }

    const distMatch = stateMatch.districts.find((d) => d.name.toLowerCase() === districtName.toLowerCase());
    if (!distMatch) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        field: 'district',
        detectedValue: districtName,
        expectedCondition: `Must belong to state: ${stateMatch.state}`,
        explanation: `District "${districtName}" is not registered under State "${stateMatch.state}".`,
        recommendedAction: 'Select the valid district from the administrative directory.',
      });
      return issues;
    }

    if (tehsilName) {
      const tehsilMatch = distMatch.tehsils.find((t) => t.name.toLowerCase() === tehsilName.toLowerCase());
      if (!tehsilMatch) {
        issues.push({
          ruleId: this.id,
          ruleName: this.name,
          severity: 'info',
          field: 'tehsil',
          detectedValue: tehsilName,
          expectedCondition: `Must be recognized in District ${distMatch.name}`,
          explanation: `Tehsil "${tehsilName}" is unrecognized in District "${distMatch.name}".`,
          recommendedAction: 'Review tehsil spelling or add newly gazetted tehsil to master list.',
        });
      } else if (villageName) {
        const villageMatch = tehsilMatch.villages.find((v) => v.toLowerCase() === villageName.toLowerCase());
        if (!villageMatch) {
          issues.push({
            ruleId: this.id,
            ruleName: this.name,
            severity: 'info',
            field: 'village',
            detectedValue: villageName,
            expectedCondition: `Must be mapped to Tehsil ${tehsilMatch.name}`,
            explanation: `Village "${villageName}" not found in current Tehsil "${tehsilMatch.name}" roster.`,
            recommendedAction: 'Verify local revenue census village code (LGD Code).',
          });
        }
      }
    }

    return issues;
  }
}

/**
 * RULE 8: Owner conflict rule
 * Two records reference the same survey/khasra combination but different owners
 */
export class OwnershipConflictRule implements ValidationRule {
  id = 'RULE_08_OWNER_CONFLICT';
  name = 'Cross-Document Title Conflict';
  description = 'Detects conflicting title claims across multiple digitized historical deeds for the same parcel.';
  severity: IssueSeverity = 'critical';

  validate(record: LandRecord, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const survey = record.surveyNumber?.value?.trim();
    const khasra = record.khasraNumber?.value?.trim();
    const owner = record.ownerName?.value?.trim().toLowerCase();

    if (!survey || !owner) return issues;

    const conflicts = context.existingRecords.filter((r) => {
      if (r.recordId === record.recordId) return false;
      const sameSurvey = r.surveyNumber?.value?.trim() === survey;
      const sameKhasra = khasra && r.khasraNumber?.value?.trim() === khasra;
      const diffOwner = r.ownerName?.value && !r.ownerName.value.toLowerCase().includes(owner);
      return (sameSurvey || sameKhasra) && diffOwner;
    });

    if (conflicts.length > 0) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        field: 'ownerName',
        detectedValue: record.ownerName.value,
        expectedCondition: 'Unambiguous single legal deed holder or documented succession',
        explanation: `Ownership conflict: Record claims "${record.ownerName.value}", while conflicting active Record ${conflicts[0].recordId} registers "${conflicts[0].ownerName.value}".`,
        recommendedAction: 'Ownership conflict requires mandatory SDM / Tehsildar human verification.',
        relatedRecordIds: conflicts.map((c) => c.recordId),
      });
    }

    return issues;
  }
}

/**
 * RULE 9: Land classification
 * Validate land classification against allowed categories
 */
export class LandClassificationRule implements ValidationRule {
  id = 'RULE_09_LAND_CLASSIFICATION';
  name = 'Land Classification Taxonomy';
  description = 'Validates land use category against official National Land Records Modernization Programme (NLRMP) codes.';
  severity: IssueSeverity = 'warning';

  validate(record: LandRecord): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const cls = record.landClassification?.value;

    if (cls && !VALID_LAND_CLASSIFICATIONS.includes(cls)) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        field: 'landClassification',
        detectedValue: cls,
        expectedCondition: `Allowed values: ${VALID_LAND_CLASSIFICATIONS.join(', ')}`,
        explanation: `Extracted land classification "${cls}" is non-standard.`,
        recommendedAction: 'Map to nearest standard revenue classification.',
      });
    }

    return issues;
  }
}

/**
 * RULE 10: Confidence-based validation
 * If any critical field has confidence < 70%, automatically flag for human review
 */
export class ConfidenceRule implements ValidationRule {
  id = 'RULE_10_CONFIDENCE_THRESHOLD';
  name = 'AI Confidence & Uncertainty Guardrail';
  description = 'Flags extracted critical fields having AI/OCR confidence below the mandatory threshold (< 70%).';
  severity: IssueSeverity = 'warning';

  validate(record: LandRecord): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const criticalFields = [
      { name: 'ownerName', label: 'Owner Name', field: record.ownerName },
      { name: 'surveyNumber', label: 'Survey Number', field: record.surveyNumber },
      { name: 'area', label: 'Area', field: record.area },
      { name: 'mutationNumber', label: 'Mutation Number', field: record.mutationNumber },
    ];

    for (const item of criticalFields) {
      if (item.field) {
        const confPct = item.field.confidence <= 1 ? item.field.confidence * 100 : item.field.confidence;
        if (confPct < 70) {
          issues.push({
            ruleId: this.id,
            ruleName: this.name,
            severity: 'warning',
            field: item.name,
            detectedValue: `${item.field.value} (Confidence: ${Math.round(confPct)}%)`,
            expectedCondition: 'Extraction confidence >= 70% for automated digitization',
            explanation: `AI confidence for ${item.label} is only ${Math.round(confPct)}%. Text may be degraded, handwritten, or occluded.`,
            recommendedAction: 'Assigned to Verification Queue for visual inspection and manual correction.',
          });
        }
      }
    }

    return issues;
  }
}

/**
 * Validation Engine Orchestrator
 */
export class ValidationEngine {
  private rules: ValidationRule[] = [];

  constructor() {
    this.rules = [
      new SurveyNumberConsistencyRule(),
      new AreaConsistencyRule(),
      new DuplicateRecordRule(),
      new DateConsistencyRule(),
      new AreaPositiveRule(),
      new RequiredFieldsRule(),
      new AdministrativeHierarchyRule(),
      new OwnershipConflictRule(),
      new LandClassificationRule(),
      new ConfidenceRule(),
    ];
  }

  public validateRecord(record: LandRecord, context: ValidationContext): ValidationResult {
    const allIssues: ValidationIssue[] = [];
    const passedRules: string[] = [];

    for (const rule of this.rules) {
      const ruleIssues = rule.validate(record, context);
      if (ruleIssues.length === 0) {
        passedRules.push(rule.name);
      } else {
        allIssues.push(...ruleIssues);
      }
    }

    const criticalIssues = allIssues.filter((i) => i.severity === 'critical');
    const warningIssues = allIssues.filter((i) => i.severity === 'warning');

    let overallStatus: ValidationStatus = 'passed';
    if (criticalIssues.length > 0) {
      overallStatus = 'failed';
    } else if (warningIssues.length > 0) {
      overallStatus = 'warning';
    }

    // Calculate quality score: 100 base, -20 per critical, -8 per warning
    const penalty = criticalIssues.length * 20 + warningIssues.length * 8;
    const validationScore = Math.max(10, Math.min(100, 100 - penalty));

    // Extract cross record conflicts
    const crossRecordConflicts: ValidationResult['crossRecordConflicts'] = [];
    criticalIssues.forEach((issue) => {
      if (issue.relatedRecordIds && issue.relatedRecordIds.length > 0) {
        crossRecordConflicts.push({
          conflictType: issue.ruleName,
          details: issue.explanation,
          conflictingRecordId: issue.relatedRecordIds[0],
        });
      }
    });

    return {
      validationId: `VAL-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      recordId: record.recordId,
      documentId: record.documentId,
      validationScore,
      overallStatus,
      criticalIssuesCount: criticalIssues.length,
      warningIssuesCount: warningIssues.length,
      passedRulesCount: passedRules.length,
      issues: allIssues,
      passedRules,
      crossRecordConflicts,
      dataQualityScore: validationScore,
      executedAt: new Date().toISOString(),
    };
  }
}

export const validationEngine = new ValidationEngine();
