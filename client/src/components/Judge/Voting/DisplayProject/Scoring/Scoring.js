import React, {useEffect} from 'react'
import CategoryScores from './CategoryScores'

const Scoring = function({
  currCategoryId,
  projectId,
  categoryData,
  categoryIds,
  showDescription,
  onScoreEvent
}) {
  useEffect(() => {
    console.log(categoryData);
    console.log(currCategoryId);
  }, [categoryData, currCategoryId])
  return (
    <div
      key={currCategoryId}
      className={
        "vote-scores "
        + (showDescription ? "is-hidden-mobile" : "")
      }
    >
      <CategoryScores
        onScoreEvent={onScoreEvent}
        categoryData={categoryData[currCategoryId]}
        categoryId={currCategoryId}
        projectId={projectId}
      />
    </div>
  )
}

export default Scoring;