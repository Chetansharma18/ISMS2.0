export interface Scheme {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CourseMaster {
  sr_no: number;
  sector: string;
  qp_job_role_name: string;
  qp_job_role_code: string;
  version: string;
  nsqf_level: number;
  common_norms_category: string;
  theory_duration_hours: number | string;
  practical_mandatory_ojt_duration: string;
  it_soft_skill_training_hours: number | string;
  total_qp_hours: number | string;
  course_valid_up_to: string;
  remark: string;
  course_version_id: string;
  source_scheme_group: string;
  course_valid_up_to_date: number | string;
  source_status: string;
}

export interface SchemeCourseMapping {
  scheme_id: string;
  course_version_id: string;
  status: 'ACTIVE' | 'INACTIVE';
}
