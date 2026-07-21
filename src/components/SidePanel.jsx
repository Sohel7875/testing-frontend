import React, { useEffect, useRef, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'

const SidePanel = ({ isOpen, source, onClose, children, width = '50%' }) => {

    const [shouldRender, setShouldRender] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef(null);
    const [height, setHeight] = useState("0px");

    const handleClose = () => {
        setShouldRender(false);
        setTimeout(() => {
            onClose();
        }, 500);
    };

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        }
    }, [isOpen]);


    useEffect(() => {
        if (isExpanded) {
            setHeight(`${contentRef.current.scrollHeight}px`);
        } else {
            setHeight("0px");
        }
    }, [isExpanded]);
    
    return (
        <>      
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${isOpen && shouldRender ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                style={{ zIndex: 500 }}
                onClick={handleClose}
            />

            <div
                className={`fixed inset-y-0 right-0 bg-[#282E2E] shadow-lg text-white transform transition-transform duration-500 ease-in-out ${isOpen && shouldRender ? "translate-x-0" : "translate-x-full"
                    }  overflow-y-auto`}
                style={{
                    zIndex: 600,
                    width: width

                }}
            >
                <div className="flex justify-end p-[1rem]">
                    <button onClick={handleClose} className="text-gray-400 hover:text-white">
                        <AiOutlineClose size={20} />
                    </button>
                </div>

                <div className="space-y-6 pl-4 pr-1 pb-[1rem]  h-[90%] overflow-y-auto scrollbar">
                    {
                        children
                    }
                </div>
            </div>
        </>
    )
}

export default SidePanel