import flowbite from "flowbite-react/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
	content: [
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
		flowbite.content(),
	],
	theme: {
    	extend: {
    		colors: {
    			primary: {
    				'100': '#ccf0f2',
    				'200': '#99e2e5',
    				'300': '#66d3d8',
    				'400': '#33c5cb',
    				'500': '#00b6be',
    				'600': '#009298',
    				'700': '#006d72',
    				'800': '#00494c',
    				'900': '#002426',
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				'50': '#e6f0f3',
    				'100': '#cce2e6',
    				'200': '#99c5ce',
    				'300': '#66a7b5',
    				'400': '#338a9d',
    				'500': '#006d84',
    				'600': '#00576a',
    				'700': '#00414f',
    				'800': '#002c35',
    				'900': '#00161a',
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			accent: {
    				'50': '#fef3e9',
    				'100': '#fde6d2',
    				'200': '#fbcda6',
    				'300': '#f9b479',
    				'400': '#f79b4d',
    				'500': '#f58220',
    				'600': '#c4681a',
    				'700': '#934e13',
    				'800': '#62340d',
    				'900': '#311a06',
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			neutral: {
    				'50': '#ececee',
    				'100': '#d8dadc',
    				'200': '#b1b4b9',
    				'300': '#8b8f97',
    				'400': '#646974',
    				'500': '#3d4451',
    				'600': '#313641',
    				'700': '#252931',
    				'800': '#181b20',
    				'900': '#0c0e10'
    			},
    			info: {
    				'50': '#e6f1f1',
    				'100': '#cce3e4',
    				'200': '#99c8c8',
    				'300': '#66acad',
    				'400': '#339191',
    				'500': '#007576',
    				'600': '#005e5e',
    				'700': '#004647',
    				'800': '#002f2f',
    				'900': '#001718'
    			},
    			success: {
    				'50': '#f6faeb',
    				'100': '#edf5d7',
    				'200': '#dbebb0',
    				'300': '#cae288',
    				'400': '#b8d861',
    				'500': '#a6ce39',
    				'600': '#85a52e',
    				'700': '#647c22',
    				'800': '#425217',
    				'900': '#21290b'
    			},
    			warning: {
    				'50': '#fff7e8',
    				'100': '#feefd1',
    				'200': '#fedfa2',
    				'300': '#fdcf74',
    				'400': '#fdbf45',
    				'500': '#fcaf17',
    				'600': '#ca8c12',
    				'700': '#97690e',
    				'800': '#654609',
    				'900': '#322305'
    			},
    			error: {
    				'50': '#f4eaed',
    				'100': '#ead5dc',
    				'200': '#d5abb9',
    				'300': '#bf8195',
    				'400': '#aa5772',
    				'500': '#952d4f',
    				'600': '#77243f',
    				'700': '#591b2f',
    				'800': '#3c1220',
    				'900': '#1e0910'
    			},
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		fontFamily: {
    			pop: ["SeccaKjG", "Helvetica"]
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
	plugins: [
		flowbite.plugin(),
        require("tailwindcss-animate")
    ],
}

