import React, {useEffect} from 'react'

const CategorySelection = function({
  currCategoryId,
  categoryData,
  categoryIds,
  onScoreEvent,
}) {

  const Tabs = categoryIds.map( (categoryId) => 
    <li key={categoryId} className={((currCategoryId === categoryId) ? "is-active" : "")}>
      <a href onClick={() => onScoreEvent('changeCategory', {categoryId})}>{categoryData[categoryId].name}</a>
    </li>
  );

  return <div key="currCategoryId" className="tabs"><ul>{Tabs}</ul></div>
}

export default CategorySelection;