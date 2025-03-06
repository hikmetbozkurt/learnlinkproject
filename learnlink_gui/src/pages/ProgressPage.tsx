import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../api/axiosConfig';
import '../styles/pages/progress.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CourseStats {
  course_id: number;
  title: string;
  student_count: number;
  max_students: number;
  instructor_name: string;
}

const ProgressPage: React.FC = () => {
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        const response = await api.get('/api/courses');
        setCourseStats(response.data);
      } catch (err) {
        setError('Failed to fetch course statistics');
        console.error('Error fetching course stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseStats();
  }, []);

  const data = {
    labels: courseStats.map(stat => stat.title),
    datasets: [
      {
        label: 'Current Students',
        data: courseStats.map(stat => stat.student_count),
        backgroundColor: '#512da8',
      },
      {
        label: 'Maximum Capacity',
        data: courseStats.map(stat => stat.max_students),
        backgroundColor: '#e0e0e0',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const courseIndex = context.dataIndex;
            const course = courseStats[courseIndex];
            if (context.datasetIndex === 0) {
              return `Current Students: ${context.raw}`;
            }
            return `Maximum Capacity: ${context.raw}`;
          },
          afterBody: (tooltipItems: any) => {
            const courseIndex = tooltipItems[0].dataIndex;
            const course = courseStats[courseIndex];
            return [
              `Instructor: ${course.instructor_name}`,
              `Enrollment Rate: ${Math.round((course.student_count / course.max_students) * 100)}%`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Courses'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Students'
        }
      }
    }
  };


  if (error) {
    return <div className="error">{error}</div>;
  }

  // Calculate overall statistics
  const totalStudents = courseStats.reduce((sum, course) => sum + course.student_count, 0);
  const totalCapacity = courseStats.reduce((sum, course) => sum + course.max_students, 0);
  const averageEnrollmentRate = courseStats.length > 0
    ? Math.round((totalStudents / totalCapacity) * 100)
    : 0;

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>Course Statistics Dashboard</h1>
        <p>Overview of course enrollments and capacity</p>
      </div>
      
      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="stat-value">{totalStudents}</div>
        </div>
        <div className="stat-card">
          <h3>Total Capacity</h3>
          <div className="stat-value">{totalCapacity}</div>
        </div>
        <div className="stat-card">
          <h3>Average Enrollment Rate</h3>
          <div className="stat-value">{averageEnrollmentRate}%</div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h2>Course Enrollment Statistics</h2>
        </div>
        <div className="chart-wrapper">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default ProgressPage; 