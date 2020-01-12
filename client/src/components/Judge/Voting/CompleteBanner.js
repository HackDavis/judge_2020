import React from 'react';

export default function CompleteBanner({ isAllDone }) {
  return (
    <div className="notification">
      { isAllDone ? (
        <>
          <i className="far fa-grin-beam"></i>
          <span> <b>You're done!</b> You have no more projects left to score.</span>
        </>
      ) : (
        <>
          <i className="far fa-check-circle"></i>
          <span> You have already scored this project.</span>
        </>
      )}
    </div>
  );
}