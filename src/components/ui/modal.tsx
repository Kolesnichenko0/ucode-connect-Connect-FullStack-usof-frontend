// components/ui/modal.tsx
import React from 'react'
import ReactDOM from 'react-dom'

interface ModalProps {
    children: React.ReactNode
    onClose: () => void
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded shadow-lg w-full max-w-md">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    &#10005;
                </button>
                {children}
            </div>
        </div>,
        document.body
    )
}

export default Modal
