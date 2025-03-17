
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export const LandingPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">Takes a Village</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Connecting families with care professionals and building supportive communities.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to="/pricing">
            <Button variant="outline" size="lg">View Pricing</Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">For Families</h2>
          <p className="text-gray-600 mb-4">
            Find qualified care professionals who understand your unique needs.
          </p>
          <Link to="/family-matching" className="text-primary hover:underline">
            Find Care Professionals →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">For Professionals</h2>
          <p className="text-gray-600 mb-4">
            Connect with families who need your expertise and specialized care.
          </p>
          <Link to="/professional-matching" className="text-primary hover:underline">
            Find Care Opportunities →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">For Communities</h2>
          <p className="text-gray-600 mb-4">
            Build supportive networks and share resources with others.
          </p>
          <Link to="/register" className="text-primary hover:underline">
            Join the Community →
          </Link>
        </div>
      </div>
      
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
            <p className="text-gray-600">Sign up as a family, care professional, or community member.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
            <p className="text-gray-600">Tell us about your needs or qualifications.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h3 className="text-xl font-semibold mb-2">Connect</h3>
            <p className="text-gray-600">Find the right match and start building relationships.</p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <Link to="/register">
          <Button size="lg" className="px-8">Sign Up Now</Button>
        </Link>
      </div>
    </div>
  );
};
