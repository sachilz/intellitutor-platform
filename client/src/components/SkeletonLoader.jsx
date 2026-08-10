import React from 'react';

export const CourseCardSkeleton = () => (
  <div className="skeleton-card">
    <div>
      <div className="skeleton skeleton-text" style={{ width: '30%', height: '16px' }}></div>
      <div className="skeleton skeleton-title" style={{ width: '85%' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
    </div>
    <div className="skeleton" style={{ height: '38px', borderRadius: '10px' }}></div>
  </div>
);

export const CourseGridSkeleton = ({ count = 6 }) => (
  <div className="courses-grid">
    {Array.from({ length: count }).map((_, i) => (
      <CourseCardSkeleton key={i} />
    ))}
  </div>
);

export const CourseDetailSkeleton = () => (
  <div className="course-detail-layout">
    <div className="glass-card course-info-panel">
      <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '12px' }}></div>
      <div className="skeleton skeleton-title" style={{ width: '70%', height: '36px' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '100%', height: '18px' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '80%', height: '18px' }}></div>
      <div className="course-info-grid" style={{ marginTop: '20px' }}>
        <div className="skeleton" style={{ height: '40px' }}></div>
        <div className="skeleton" style={{ height: '40px' }}></div>
        <div className="skeleton" style={{ height: '40px' }}></div>
      </div>
    </div>
    <div className="glass-card action-panel">
      <div className="skeleton skeleton-title" style={{ width: '60%' }}></div>
      <div className="skeleton" style={{ height: '48px', borderRadius: '10px' }}></div>
    </div>
  </div>
);

export default CourseGridSkeleton;
