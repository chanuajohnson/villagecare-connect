
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DatabaseFeatureCard } from './DatabaseFeatureCard';
import { TechInnovatorsHub } from './TechInnovatorsHub';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in_development' | 'ready_for_demo' | 'launched';
  _count?: {
    votes: number;
  };
}

const FeaturesGrid = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  const databaseFeatures = [
    {
      id: '1',
      title: 'Calendar Integration',
      description: 'Sync your care schedule with popular calendar apps',
      status: 'planned'
    },
    {
      id: '2',
      title: 'Care Team Chat',
      description: 'Real-time messaging between family members and care professionals',
      status: 'planned'
    },
    {
      id: '3',
      title: 'Medication Reminders',
      description: 'Smart notifications for medication schedules',
      status: 'in_development'
    },
    {
      id: '4',
      title: 'Care Reports',
      description: 'Generate detailed care reports for health providers',
      status: 'planned'
    },
    {
      id: '5',
      title: 'Medication Management',
      description: 'Automated reminders, dosage tracking, and refill alerts. Ensures patients never miss critical medications and keeps families and caregivers in sync about dosage changes or refill schedules.',
      status: 'planned'
    },
    {
      id: '6',
      title: 'Calendar & Scheduling Integration',
      description: 'Syncing appointments and tasks with Google Calendar, Outlook, or an internal scheduler. Centralizes all care-related events and reduces scheduling conflicts, providing a clear overview for both families and caregivers.',
      status: 'planned'
    },
    {
      id: '7',
      title: 'Activity & Care Logs',
      description: 'A daily or weekly log where caregivers record completed tasks, notes, or observations. Keeps families informed about care routines and helps identify patterns or issues early, serving as a record for agencies.',
      status: 'planned'
    },
    {
      id: '8',
      title: 'Meal Planning & Nutrition Tracking',
      description: 'Tools for scheduling meals, noting dietary restrictions, and logging nutritional intake. Maintains consistent meal plans and ensures dietary needs are met, supporting better health outcomes through structured meal tracking.',
      status: 'in_development'
    },
    {
      id: '9',
      title: 'Emergency Alerts & Fall Detection',
      description: 'A panic button, sensor integration, or automated alerts for sudden changes (e.g., fall, wandering, vital sign fluctuations). Provides peace of mind and offers rapid response options when urgent help is needed.',
      status: 'planned'
    },
    {
      id: '10',
      title: 'Resource Library & Training Modules',
      description: 'Articles, videos, and best practices for handling specific conditions. Empowers caregivers and families with up-to-date knowledge and enhances care quality by providing accessible training resources.',
      status: 'planned'
    },
    {
      id: '11',
      title: 'HR and Admin Services',
      description: 'Tools to manage caregiver onboarding, track certifications, handle payroll, and maintain compliance with regulations. Streamlines administration and ensures regulatory compliance.',
      status: 'planned'
    },
    {
      id: '12',
      title: 'Task & Routine Templates',
      description: 'Pre-built or customizable care plan templates for daily routines. Saves time for caregivers by standardizing routines and ensures consistency in care delivery.',
      status: 'planned'
    },
    {
      id: '13',
      title: 'Billing & Invoicing',
      description: 'A system for tracking hours, generating invoices, or processing payments. Simplifies the administrative side of care and reduces errors in payment workflows.',
      status: 'planned'
    },
    {
      id: '14',
      title: 'On-Demand Care Requests',
      description: 'A short-notice request system for quickly finding and booking available caregivers. Provides immediate relief for unexpected care needs and flexible work opportunities.',
      status: 'planned'
    }
  ];

  useEffect(() => {
    setFeatures(databaseFeatures);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading features...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <DatabaseFeatureCard key={feature.id} feature={feature} />
      ))}
      <TechInnovatorsHub />
    </div>
  );
};

export default FeaturesGrid;
