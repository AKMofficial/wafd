import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const PilgrimIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"
      fill="currentColor"
    />
    <path
      d="M12 7C13.5 7 14.8 7.7 15.6 8.8L16.7 10.4C17.2 11.2 16.6 12.2 15.7 12.2H14V20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20V12.2H8.3C7.4 12.2 6.8 11.2 7.3 10.4L8.4 8.8C9.2 7.7 10.5 7 12 7Z"
      fill="currentColor"
    />
  </svg>
);

export const BedIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 7C3 5.9 3.9 5 5 5H11C12.1 5 13 5.9 13 7V11H19C20.1 11 21 11.9 21 13V17H22V19H20V20C20 20.6 19.6 21 19 21C18.4 21 18 20.6 18 20V19H6V20C6 20.6 5.6 21 5 21C4.4 21 4 20.6 4 20V19H2V17H3V7ZM5 7V11H11V7H5ZM5 13V17H19V13H5Z"
      fill="currentColor"
    />
  </svg>
);

export const HallIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 8L12 3L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V8Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M9 12H15V20H9V12Z"
      fill="currentColor"
    />
    <path
      d="M8 9C8 8.4 8.4 8 9 8H10C10.6 8 11 8.4 11 9V10C11 10.6 10.6 11 10 11H9C8.4 11 8 10.6 8 10V9Z"
      fill="currentColor"
    />
    <path
      d="M13 9C13 8.4 13.4 8 14 8H15C15.6 8 16 8.4 16 9V10C16 10.6 15.6 11 15 11H14C13.4 11 13 10.6 13 10V9Z"
      fill="currentColor"
    />
  </svg>
);

export const TentIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 2L4 20H8L12 10L16 20H20L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M12 10L9 17H15L12 10Z"
      fill="currentColor"
    />
  </svg>
);

export const TransferIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8 7L4 11L8 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17L20 13L16 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 11H14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M10 13H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const CheckInIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M12 7V12L15 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SpecialNeedsIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="12"
      cy="4"
      r="2"
      fill="currentColor"
    />
    <path
      d="M19 13V16C19 17.1 18.1 18 17 18H16V22H14V18H10V22H8V18C6.9 18 6 17.1 6 16V13C6 11.9 6.9 11 8 11H11V9C11 7.9 11.9 7 13 7C14.1 7 15 7.9 15 9V11H16C17.1 11 18 11.9 18 13H19Z"
      fill="currentColor"
    />
    <circle
      cx="12"
      cy="13"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

export const VacantIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="4 4"
      fill="none"
    />
  </svg>
);

export const OccupiedIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="currentColor"
    />
    <path
      d="M8 12L11 15L16 9"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MaleIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="10"
      cy="14"
      r="5"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M15.5 8.5L19 5M19 5H15M19 5V9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FemaleIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="12"
      cy="9"
      r="5"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M12 14V19M10 17H14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M16 2V6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 2V6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M3 10H21"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="11"
      cy="11"
      r="8"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M21 21L16.65 16.65"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const FilterIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 6H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6 12H18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 18H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const ExportIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 10L12 3L17 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 3V15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const ImportIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 8L12 15L7 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15V3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);