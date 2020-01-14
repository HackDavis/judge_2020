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

  const Tabs = categoryIds.map( (categoryId, index) => 
    <li key={categoryId} className={((currCategoryId === categoryId) ? "is-active" : "")}>
      <a onClick={() => onScoreEvent('changeCategory', {categoryId})}>Rubric {index+1}</a>
    </li>
  );

  const Rubrics = categoryIds.map( (categoryId) => 
    <div
      key={categoryId}
      className={(currCategoryId === categoryId ? "" : "hidden")}
    >
      <CategoryScores
        onScoreEvent={onScoreEvent}
        categoryData={categoryData[categoryId]}
        categoryId={categoryId}
        projectId={projectId}
      />
    </div>
  );

  return (
    <div key={currCategoryId} className={ "vote-scores " + (showDescription ? "is-hidden-small" : "") }>

      <div class="tabs">
        <ul>{Tabs}</ul>
      </div>

      {Rubrics}

    </div>
  )
}

export default Scoring;