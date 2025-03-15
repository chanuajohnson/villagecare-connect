
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const FeatureInterestTrackingStats = () => {
  const [featureClicks, setFeatureClicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchFeatureClicks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('feature_interest_tracking')
        .select('*')
        .order('clicked_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching feature clicks:', error);
        return;
      }
      
      setFeatureClicks(data || []);
    } catch (err) {
      console.error('Error in fetchFeatureClicks:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFeatureClicks();
  }, []);
  
  // Prepare data for the chart
  const prepareChartData = () => {
    // Group by date
    const clicksByDate = featureClicks.reduce((acc, click) => {
      const date = new Date(click.clicked_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array for the chart
    return Object.entries(clicksByDate).map(([date, count]) => ({
      date,
      clicks: count
    }));
  };
  
  // Count unique users
  const uniqueUsers = new Set(featureClicks.map(click => click.user_id)).size;
  
  // Export data as CSV
  const exportCSV = () => {
    if (featureClicks.length === 0) return;
    
    const headers = ['id', 'user_id', 'feature_name', 'clicked_at', 'source_page', 'user_email', 'action_type'];
    const csvData = featureClicks.map(click => headers.map(header => JSON.stringify(click[header] || '')).join(','));
    
    const csv = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'feature_interest_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const chartData = prepareChartData();
  
  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Premium Feature Interest Tracking</CardTitle>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={featureClicks.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading stats...</div>
        ) : featureClicks.length === 0 ? (
          <div className="text-center py-8">No feature interest data available yet.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Total Clicks</h3>
                <p className="text-3xl font-bold">{featureClicks.length}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Unique Users</h3>
                <p className="text-3xl font-bold">{uniqueUsers}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Conversion Rate</h3>
                <p className="text-3xl font-bold">
                  {featureClicks.length > 0 ? 
                    `${Math.round((uniqueUsers / featureClicks.length) * 100)}%` : 
                    '0%'}
                </p>
              </div>
            </div>
            
            {chartData.length > 0 && (
              <div className="h-80 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#4f46e5" name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Recent Interest</h3>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">User</th>
                      <th className="p-2 text-left">Feature</th>
                      <th className="p-2 text-left">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureClicks.slice(0, 10).map((click, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">
                          {new Date(click.clicked_at).toLocaleDateString()} 
                          {new Date(click.clicked_at).toLocaleTimeString()}
                        </td>
                        <td className="p-2">{click.user_email || click.user_id || 'Anonymous'}</td>
                        <td className="p-2">{click.feature_name}</td>
                        <td className="p-2">{click.source_page}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
