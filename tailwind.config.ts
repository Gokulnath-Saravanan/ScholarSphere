import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// ScholarSphere custom colors
				'scholar-blue': {
					900: '#212A31', // Very dark, almost blackish blue
					700: '#2E3944', // Deep, muted navy blue
					500: '#124E66', // Medium, slightly teal-leaning blue
					300: '#748D92', // Light, grayish-blue
					100: '#D3D9D4'  // Very light, almost white gray
				}
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
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'float': 'float 6s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-scholar': 'linear-gradient(135deg, #3D52A0 0%, #7091E6 50%, #8697C4 100%)',
				'gradient-light': 'linear-gradient(135deg, #EDE8F5 0%, #ADBBDA 100%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

import { useEffect, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export function AnalyticsOverview() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data, error } = await supabase
      .from('research_trends')
      .select('*')
      .order('year', { ascending: true });

    if (data) setTrends(data);
    setLoading(false);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Research Trends Analysis',
        color: '#124E66', // Using scholar-blue-500
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#D3D9D4', // Using scholar-blue-100
        },
        ticks: {
          color: '#2E3944', // Using scholar-blue-700
        },
      },
      x: {
        grid: {
          color: '#D3D9D4', // Using scholar-blue-100
        },
        ticks: {
          color: '#2E3944', // Using scholar-blue-700
        },
      },
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-scholar-blue-700">Research Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center">Loading...</div>
          ) : (
            <Line
              data={{
                labels: trends.map(t => t.year),
                datasets: [{
                  label: 'Publication Count',
                  data: trends.map(t => t.publication_count),
                  borderColor: '#124E66', // scholar-blue-500
                  backgroundColor: '#748D92', // scholar-blue-300
                }],
              }}
              options={chartOptions}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
