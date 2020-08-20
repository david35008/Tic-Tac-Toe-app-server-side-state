import React, { useState } from 'react';

function Square(props) {


    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

export default Square;