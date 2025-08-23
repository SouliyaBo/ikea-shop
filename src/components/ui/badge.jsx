"use client"

import React from "react"

/**
 * Badge component props
 * @typedef {Object} BadgeProps
 * @property {React.ReactNode} children - Content to display inside the badge
 * @property {'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'purple' | 'pink' | 'gray' | 'destructive'} [variant='default'] - Visual style variant
 * @property {'sm' | 'md' | 'lg' | 'xl'} [size='md'] - Size of the badge
 * @property {string} [className=''] - Additional CSS classes
 * @property {() => void} [onClick] - Click handler function
 */

/**
 * Badge component for displaying short status descriptors
 * @param {BadgeProps} props - Component props
 */
export default function Badge({ children, variant = "default", size = "md", className = "", onClick }) {
    const baseClasses = "inline-flex items-center font-medium rounded-full transition-colors duration-200"

    const variantClasses = {
        default: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        success: "bg-green-100 text-green-800 hover:bg-green-200",
        warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        error: "bg-red-100 text-red-800 hover:bg-red-200",
        info: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
        purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
        pink: "bg-pink-100 text-pink-800 hover:bg-pink-200",
        gray: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        destructive: "bg-gray-100 text-black-800 hover:bg-black",
    }

    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
        xl: "px-3.5 py-1.5 text-lg",
    }

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${onClick ? "cursor-pointer" : ""} ${className}`

    return (
        <span className={classes} onClick={onClick} role="status">
            {children}
        </span>
    )
}