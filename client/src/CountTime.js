import React, { useEffect } from 'react';
 
 function CountTime({ setSeconds ,isActive, seconds }) {

    useEffect(() => {
        let interval = null;
        if (isActive) {
          interval = setInterval(() => {
            setSeconds(seconds => seconds + 1);
          }, 1000);
        } else if (!isActive && seconds !== 0) {
          clearInterval(interval);
        }
        return () => clearInterval(interval);
      }, [isActive, seconds]);

    return (
        <div className="time">
        {`${seconds}s`}
      </div>
    )
}

export default CountTime;