
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FamilyDashboard = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome to Tavara! 🚀 It takes a village to care.</h1>
          <p className="text-gray-600 mb-4">Connect with caregivers, explore features, and help shape the future of care</p>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="default">View Care Plans</Button>
            <Button variant="outline">Find a Caregiver</Button>
            <Button variant="outline">Upvote Features</Button>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-2">Family Dashboard</h2>
        <p className="text-gray-600 mb-8">Comprehensive care coordination platform.</p>
        
        {/* Caregiver Matching Card */}
        <div className="border rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-semibold text-blue-800">Find the Right Caregiver in Minutes</h3>
            </div>
            <p className="text-gray-600 mb-4">Personalized Matching Based on Your Needs</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Get matched instantly with vetted caregivers.</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Compare caregiver profiles, pricing, and services.</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Message caregivers & book services directly.</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Peace of mind with background-checked professionals.</span>
                </div>
                
                <Button size="lg" className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  Find Your Caregiver Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Why Families Trust Us</h4>
                <p className="text-gray-600 mb-3 text-sm">
                  Our matching system considers over 20 compatibility factors to ensure you find the perfect caregiver for your unique situation.
                </p>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-white rounded p-2 shadow-sm">
                    <span className="block text-xl font-bold text-blue-600">93%</span>
                    <span className="text-gray-500">Match Satisfaction</span>
                  </div>
                  <div className="bg-white rounded p-2 shadow-sm">
                    <span className="block text-xl font-bold text-blue-600">48hrs</span>
                    <span className="text-gray-500">Average Match Time</span>
                  </div>
                  <div className="bg-white rounded p-2 shadow-sm">
                    <span className="block text-xl font-bold text-blue-600">100%</span>
                    <span className="text-gray-500">Verified Caregivers</span>
                  </div>
                  <div className="bg-white rounded p-2 shadow-sm">
                    <span className="block text-xl font-bold text-blue-600">24/7</span>
                    <span className="text-gray-500">Support Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tell Their Story Card */}
        <div className="border rounded-lg shadow-sm mb-8 overflow-hidden bg-blue-50">
          <div className="p-6">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-semibold text-blue-800">Tell Their Story – Honoring Their Life & Needs</h3>
            </div>
            <p className="text-gray-600 mb-4">Share the story that makes your loved one unique</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-gray-700">
                  Help us understand who your loved one is beyond their care needs. These insights help match caregivers more effectively and enhance the quality of care they receive.
                </p>
                <p className="text-gray-500 italic text-sm">This step is optional but highly recommended for better caregiver matching.</p>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Capture the essence of who they are, not just their care needs.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Help caregivers build meaningful connections.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Ensure better caregiver-family matching with AI insights.</span>
                  </div>
                </div>
                
                <Link to="/family/story">
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    Share Their Story
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </Link>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Why Sharing Their Story Matters</h4>
                <p className="text-gray-600 mb-3 text-sm">
                  When caregivers understand the person behind the care needs, they can provide more personalized, empathetic support that honors their unique life journey.
                </p>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-blue-50 rounded p-2">
                    <span className="block text-xl font-bold text-blue-600">78%</span>
                    <span className="text-gray-500">Better Care Match</span>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <span className="block text-xl font-bold text-blue-600">92%</span>
                    <span className="text-gray-500">Family Satisfaction</span>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <span className="block text-xl font-bold text-blue-600">3x</span>
                    <span className="text-gray-500">Deeper Connection</span>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <span className="block text-xl font-bold text-blue-600">65%</span>
                    <span className="text-gray-500">Less Transition Issues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Message Board and Post Care Need */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Message Board Card */}
          <div className="border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                <h3 className="text-xl font-semibold text-blue-800">Message Board</h3>
              </div>
              <p className="text-gray-600 mb-3">Care provider availability in Trinidad and Tobago</p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm py-1 px-2 bg-blue-100 text-blue-800 rounded-full">Professional</span>
              </div>
              
              <div className="py-8 text-center text-gray-500">
                <p>No care providers found in Trinidad and Tobago</p>
              </div>
              
              <div className="text-center">
                <Button variant="outline" className="mb-4 text-blue-600 border-blue-300">Refresh Data</Button>
              </div>
              
              <Link to="/family/message-board">
                <Button variant="outline" className="w-full">View Full Message Board</Button>
              </Link>
            </div>
          </div>
          
          {/* Post Care Need Card */}
          <div className="border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
                </svg>
                <h3 className="text-xl font-semibold text-blue-800">Post Care Need</h3>
              </div>
              <p className="text-gray-600 mb-3">Share your care requirements with our network</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Find Qualified Care Providers</h4>
                  <p className="text-gray-600 text-sm mb-2">Describe your care needs and requirements to connect with qualified professionals in your area.</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                      <span>Household care</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                      <span>Child care</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                      <span>Elder care</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                      <span>Medical care</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Specify Your Requirements</h4>
                  <p className="text-gray-600 text-sm mb-2">Set your preferences for availability, skills, certifications, and experience.</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                      <span>Schedule needs</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                      <span>Experience level</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                      <span>Special skills</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                      <span>Budget range</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Unlock Care Need Posting</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Profile Management Card */}
        <div className="border rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-semibold text-blue-800">Profile Management</h3>
            </div>
            <p className="text-gray-600 mb-3">Manage your profile information and preferences</p>
            
            <p className="text-gray-700 mb-4">Keep your profile up-to-date to ensure you receive the most relevant care coordination support and recommendations.</p>
            
            <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
              Manage Profile
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
            
            <div className="flex justify-center mt-4">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                Upvote this Feature
              </Button>
            </div>
          </div>
        </div>
        
        {/* Next Steps Card */}
        <div className="border rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-13a1 1 0 112 0v4a1 1 0 01-1 1H6a1 1 0 110-2h2V5z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-semibold text-blue-800">Next Steps</h3>
            </div>
            <p className="text-gray-600 mb-3">Your care coordination progress</p>
            
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-500 text-sm">0%</p>
              <div className="w-full bg-gray-100 h-2 rounded-full ml-4 mr-2">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {/* Empty circle */}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800">Complete your profile</p>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>Pending</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Add your contact information and preferences</p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-6">
                  Complete
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </li>
              
              <li className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {/* Empty circle */}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800">Complete your loved one's profile</p>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>Pending</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Add details about your care recipient</p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-6">
                  Complete
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </li>
              
              <li className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {/* Empty circle */}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800">Set care type preferences</p>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>Pending</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Specify the types of care needed</p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-6">
                  Complete
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </li>
              
              <li className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {/* Empty circle */}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800">Complete initial care assessment</p>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>Pending</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Help us understand your care needs better</p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-6">
                  Complete
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </li>
              
              <li className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {/* Empty circle */}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800">Connect with caregivers</p>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>Pending</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Start building your care team</p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-6">
                  Complete
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </li>
            </ul>
            
            <Button variant="outline" className="w-full mt-6 flex justify-between items-center">
              <span>View all tasks</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Care Management Card */}
        <div className="border rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Care Management</h3>
            <p className="text-gray-600 mb-4">Manage care plans, team members, appointments and more</p>
            
            <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 mb-4">
              Learn More
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
            
            <div className="flex justify-center mb-6">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                Upvote this Feature
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium mb-2">New Care Plan</h4>
                <Button size="sm" variant="outline" className="w-full">Create Plan</Button>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium mb-2">Add Team Member</h4>
                <Button size="sm" variant="outline" className="w-full">Add Member</Button>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium mb-2">Schedule Appointment</h4>
                <Button size="sm" variant="outline" className="w-full">Schedule</Button>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium mb-2">Notifications</h4>
                <Button size="sm" variant="outline" className="w-full">View</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium">Care Plans</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">View and manage care plans</p>
                <Button variant="outline" size="sm" className="w-full">View Plans</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <h4 className="font-medium">Care Team</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">Manage your care team members</p>
                <Button variant="outline" size="sm" className="w-full">View Team</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium">Appointments</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">Schedule and manage appointments</p>
                <Button variant="outline" size="sm" className="w-full">View Calendar</Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Medication Management Card */}
        <div className="border rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Medication Management</h3>
            <p className="text-gray-600 mb-4">Track and manage medications, schedules, and administration</p>
            
            <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 mb-4">
              Learn More
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
            
            <div className="flex justify-center mb-6">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                Upvote this Feature
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium">Medications</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">View and manage medications</p>
                <Button variant="outline" size="sm" className="w-full">View Medications</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium">Schedule</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">Manage medication schedules</p>
                <Button variant="outline" size="sm" className="w-full">View Schedule</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H6a1 1 0 01-1-1V4zm6 5a1 1 0 00-1 1v6a1 1 0 102 0v-6a1 1 0 00-1-1zm2-4a1 1 0 10-2 0 1 1 0 002 0z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium">Planning</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">Plan medication routines</p>
                <Button variant="outline" size="sm" className="w-full">View Planning</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium">Administration</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">Track medication administration</p>
                <Button variant="outline" size="sm" className="w-full">View Administration</Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Meal Planning Card */}
        <div className="border rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Meal Planning</h3>
            <p className="text-gray-600 mb-4">Plan and manage meals, recipes, and nutrition</p>
            
            <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 mb-4">
              Learn More
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
            
            <div className="flex justify-center mb-6">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                Upvote this Feature
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium">Select Date</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">Pick a date for meal planning</p>
                <div className="mb-4 p-2 border rounded text-center text-gray-500">
                  Pick a date
                </div>
                <Button variant="outline" size="sm" className="w-full">Select Date</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium">Meal Types</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">Choose meal types for planning</p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>Morning Drink</div>
                  <div>Breakfast</div>
                  <div>Morning Snack</div>
                  <div>Lunch</div>
                  <div>Afternoon Snack</div>
                  <div>Dinner</div>
                </div>
                <Button variant="outline" size="sm" className="w-full">Select Types</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <h4 className="font-medium">Recipe Library</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">Browse and manage recipes</p>
                <Button variant="outline" size="sm" className="w-full">View Library</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium">Suggestions</h4>
                </div>
                <p className="text-sm text-gray-500 mb-3">Get personalized meal suggestions</p>
                <Button variant="outline" size="sm" className="w-full">View Suggestions</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
