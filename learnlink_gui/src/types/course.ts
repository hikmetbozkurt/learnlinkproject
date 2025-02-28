export interface Course {
  course_id: string;
  title: string;
  description: string;
  admin_id: string;
  instructor_id: string;
  instructor_name: string;
  is_admin: boolean;
  is_enrolled: boolean;
  created_at: string;
  student_count: number;
  max_students: number;
  image?: string;
} 