import React from 'react';

const WikidataIcon = ({ size = "1.5em", className = "" }) => (
    <svg 
        style={{ width: size, height: size }} 
        className={className} 
        viewBox="0 0 1050 590" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="m 120,545 h 30 V 45 H 120 V 545 z m 60,0 h 90 V 45 H 180 V 545 z M 300,45 V 545 h 90 V 45 h -90 z" fill="#990000" />
        <path d="m 840,545 h 30 V 45 H 840 V 545 z M 900,45 V 545 h 30 V 45 H 900 z M 420,545 h 30 V 45 H 420 V 545 z M 480,45 V 545 h 30 V 45 h -30 z" fill="#339966" />
        <path d="m 540,545 h 90 V 45 h -90 V 545 z m 120,0 h 30 V 45 H 660 V 545 z M 720,45 V 545 h 90 V 45 H 720 z" fill="#006699" />
    </svg>
);

export default WikidataIcon;
