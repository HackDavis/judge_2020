import React, { useState } from 'react'
import propTypes from 'prop-types'
import api from '../../ParseApi';

export default class CategoryDropdown extends React.Component {
  state = {
    active: false,
    loadedCategories: undefined,
  }

  static propTypes = {
    onSelect: propTypes.func.isRequired,
    selected: propTypes.string
  }

  categories = {};

  componentDidMount() {
    
    
  }

  componentDidUpdate() {
    this.loadCategories();
  }

  loadCategories = () => {
    if (this.state.loadedCategories) {
      return;
    }
    
    return api.getAllCategories(true)
      .then((categories) => {
        this.categories = categories.reduce((aggr, category) => {
          aggr[category.objectId] = category;
          return aggr;
        }, {})

        this.setState({loadedCategories: true})
      })
  }

  toggleActive = () => {
    this.setState((prev) => {
      return { active: !prev.active };
    })
  }

  getCategoryName(catId) {
    return this.categories[catId].name;
  }

  onSelect = (catId) => {
    this.props.onSelect(catId);
  }

  render() {
    if (!this.state.loadedCategories) {
      return (
        <div className="dropdown">
          <div className="dropdown-trigger">
            <button className="button" aria-haspopup="true" aria-controls="dropdown-menu">
              <span>...</span>
              <span className="icon is-small">
                <i className="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className={`dropdown ${(this.state.active ? "is-active" : "")}`}>
        <div className="dropdown-trigger">
          <button className="button" aria-haspopup="true" aria-controls="dropdown-menu" onClick={this.toggleActive}>
            <span>{this.props.selected === null ? "General" : (this.getCategoryName(this.props.selected))}</span>
            <span className="icon is-small">
              <i className="fas fa-angle-down" aria-hidden="true"></i>
            </span>
          </button>
        </div>
        <div key={this.state.loadedCategories} className="dropdown-menu" id="dropdown-menu" role="menu">
          <div className="dropdown-content">
            <a href
              className={`dropdown-item ${((this.props.selected === null) ? "is-active" : "")}`}
              onClick={() => this.onSelect(null)}
            >
              General
            </a>
            <hr className="dropdown-divider"/>
            { Object.values(this.categories).map((category) => 
              <a href key={category.objectId} className="dropdown-item"
                className={`dropdown-item ${((this.props.selected === category.objectId) ? "is-active" : "")}`}
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