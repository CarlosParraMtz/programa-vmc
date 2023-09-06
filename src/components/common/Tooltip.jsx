import React from 'react'

export default function Tooltip( {children, title} ) {
    return (
        <div className="tooltip">
            {children}
            <span className='tooltip-text' > {title} </span>
        </div>
    )
}
