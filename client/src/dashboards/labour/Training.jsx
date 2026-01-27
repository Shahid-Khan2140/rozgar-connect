import React, { useState } from "react";
import "../../App.css";

const Training = () => {
  const [enrolledCourses, setEnrolledCourses] = useState(JSON.parse(localStorage.getItem("enrolledCourses")) || []);

  const courses = [
    { id: 1, title: "Advanced Masonry", instructor: "Ramesh Kumar", duration: "30 hrs", level: "Intermediate", progress: 60, status: "In Progress", certificate: true },
    { id: 2, title: "Electric Safety 101", instructor: "Anil Sharma", duration: "20 hrs", level: "Beginner", progress: 0, status: "Not Started", certificate: true },
    { id: 3, title: "Welding Fundamentals", instructor: "Vikram Singh", duration: "40 hrs", level: "Beginner", progress: 100, status: "Completed", certificate: true },
    { id: 4, title: "Heavy Equipment Operation", instructor: "Suresh Patel", duration: "35 hrs", level: "Advanced", progress: 0, status: "Not Started", certificate: true },
    { id: 5, title: "Workplace Communication", instructor: "Priya Joshi", duration: "15 hrs", level: "Beginner", progress: 0, status: "Not Started", certificate: false },
    { id: 6, title: "Entrepreneurship & Business", instructor: "Deepak Verma", duration: "25 hrs", level: "Intermediate", progress: 0, status: "Not Started", certificate: false },
  ];

  const handleEnroll = (courseId) => {
    if (!enrolledCourses.includes(courseId)) {
      const updated = [...enrolledCourses, courseId];
      setEnrolledCourses(updated);
      localStorage.setItem("enrolledCourses", JSON.stringify(updated));
      alert("Successfully enrolled in course");
    }
  };

  const isEnrolled = (courseId) => enrolledCourses.includes(courseId);
  const completedCourses = courses.filter(c => c.progress === 100 && isEnrolled(c.id)).length;

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Skill Development & Vocational Training</h2>
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Available Courses</h3>
          <p className="stat-number">{courses.length}</p>
        </div>
        <div className="stat-card green">
          <h3>Completed</h3>
          <p className="stat-number">{completedCourses}</p>
        </div>
        <div className="stat-card orange">
          <h3>In Progress</h3>
          <p className="stat-number">{enrolledCourses.filter(id => courses.find(c => c.id === id && c.progress > 0 && c.progress < 100)).length}</p>
        </div>
        <div className="stat-card purple">
          <h3>Certificates Earned</h3>
          <p className="stat-number">{completedCourses}</p>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'20px', marginTop: '20px'}}>
        {courses.map((course) => {
          const enrolled = isEnrolled(course.id);
          return (
            <div key={course.id} className="card" style={{ position: 'relative', paddingBottom: '20px' }}>
              <div style={{height:'120px', background: enrolled ? '#e3f2fd' : '#eceff1', borderRadius:'8px', marginBottom:'15px', display:'flex', alignItems:'center', justifyContent:'center', color: enrolled ? '#0f2a44' : '#90a4ae', fontWeight:'600', fontSize: '24px'}}>
                {course.title.split(' ')[0]}
              </div>

              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{course.title}</h3>
              <p style={{color:'#666', fontSize:'13px', margin: '5px 0'}}>👨‍🏫 {course.instructor}</p>
              
              <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#888', margin: '10px 0' }}>
                <span>⏱️ {course.duration}</span>
                <span>📊 {course.level}</span>
              </div>

              {enrolled && course.progress > 0 && (
                <>
                  <div style={{width:'100%', background:'#eee', height:'8px', borderRadius:'4px', marginTop:'10px', marginBottom: '5px'}}>
                    <div style={{width: `${course.progress}%`, background: course.progress === 100 ? '#2e7d32' : '#ff9800', height:'100%', borderRadius:'4px', transition: 'width 0.3s'}}></div>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#666'}}>
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                {enrolled ? (
                  <>
                    <button className="btn-modern btn-primary" style={{ flex: 1, background: course.progress === 100 ? '#2e7d32' : '#0f2a44' }}>
                      {course.progress === 100 ? '✓ Completed' : 'Continue'}
                    </button>
                    {course.certificate && course.progress === 100 && (
                      <button className="btn-modern" style={{ flex: 1, background: '#ffd600', color: '#333' }}>📜 Certificate</button>
                    )}
                  </>
                ) : (
                  <button onClick={() => handleEnroll(course.id)} className="btn-modern btn-green" style={{ width: '100%' }}>
                    Start Course
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: '30px', background: '#f0f7ff', borderLeft: '4px solid #0f2a44' }}>
        <h3>📚 Learning Resources</h3>
        <p>All courses include video lectures, quizzes, and hands-on assignments. Certificates are awarded upon completion with 80% score.</p>
        <p style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>💡 Tip: Employees often earn higher wages after completing specialized skill courses!</p>
      </div>
    </div>
  );
};

export default Training;