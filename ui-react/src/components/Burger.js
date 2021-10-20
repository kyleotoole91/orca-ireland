import React, { Component } from 'react';
import Burger from 'react-css-burger';
//Usage; export default class MenuBar extends Component {...}
//<Burger onClick={() => this.setState({ active: !this.state.active })} active={this.state.active}/> 
export default class BurgerWrapper extends Component {
  state = {
    active: false,
  };

  render() {
    return (
        <Burger burger='emphatic' 
                color='#323233'
                onClick={() =>
                  this.setState({
                    active: !this.state.active,
                  })
                }
                active={this.state.active}
                {...this.props}
        />
    );
  }
}