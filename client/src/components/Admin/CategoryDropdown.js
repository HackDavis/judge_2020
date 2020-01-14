import React, { useState } from 'react'
import propTypes from 'prop-types'
import api from '../../ParseApi';

export default class CategoryDropdown extends React.Component {
  state = {
    active: false,
    selected: null,
    loadedCategories: undefined,
  }

  static propTypes = {
    onSelect: propTypes.func.isRequired
  }

  categories = [];

  componentDidMount() {
    api.getAllCategories(true)
      .then((categories) => {
        this.categories = categories.reduce((aggr, category) => {
          aggr[category.objectId] = category;
          return aggr;
        }, {})
        
        console.log(this.categories)
      })
  }

  toggleActive = () => {
    this.setState((prev) => {
      return { active: !prev.active };
    })
  }

  onSelect = (catId) => {
    this.props.onSelect(catId);
    this.setState({selected: catId});
  }

  render() {
    return (
      <div className={`dropdown ${(this.state.active ? "is-active" : "")}`}>
        <div className="dropdown-trigger">
          <button className="button" aria-haspopup="true" aria-controls="dropdown-menu" onClick={this.toggleActive}>
            <span>{this.state.selected ? this.categories[this.state.selected] : "General"}</span>
            <span className="icon is-small">
              <i className="fas fa-angle-down" aria-hidden="true"></i>
            </span>
          </button>
        </div>
        <div key={this.state.loadedCategories} className="dropdown-menu" id="dropdown-menu" role="menu">
          <div className="dropdown-content">
            <a href
              className={`dropdown-item ${((this.state.selected === null) ? "is-active" : "")}`}
              onClick={() => this.onSelect(null)}
            >
              General
            </a>
            <hr className="dropdown-divider"/>
            { Object.values(this.categories).map((category) => 
              <a href key={category.objectId} className="dropdown-item"
                className={`dropdown-item ${((this.state.selected === category.objectId) ? "is-active" : "")}`}
                onClick={() => this.onSelect(category.objectId)}
              >
                {category.name}
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }
}