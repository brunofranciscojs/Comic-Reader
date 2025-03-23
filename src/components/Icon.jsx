import React from 'react';

const Icon = ({ column, save, list, loading }) => {
    return(
        <>
            {column && <svg column width="2rem" height="2rem" viewBox="0 0 24 24"><path fill="currentColor" d="M16 5v13h5V5M4 18h5V5H4m6 13h5V5h-5z"/></svg>}
            {list && <svg list width="2rem" height="2rem" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 6h8m-8 6h10M9 18h8M5 3v18" color="currentColor"/></svg>}
            {loading && <svg loading viewBox="0 0 25 25" fill="none"><g strokeLinecap="round" strokeLinejoin="round"></g><g> <path d="M4.5 12.5C4.5 16.9183 8.08172 20.5 12.5 20.5C16.9183 20.5 20.5 16.9183 20.5 12.5C20.5 8.08172 16.9183 4.5 12.5 4.5" stroke="#121923" strokeWidth="1.2"></path> </g></svg>}
            {save && <svg save width="24" height="24" viewBox="0 0 24 24"><path fill="#eeeeee" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"></path></svg>}
        </>
    )
};

export default Icon;

