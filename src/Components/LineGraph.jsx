import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
//import '../App.css';

export const PointsGraph = ({data}) => {
    console.log(data);
  return (
    <div className="outer-line-graph">
      <h2 className="line-graph-title">Points Over Time</h2>
      <div className='line-graph'>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="matchNumber" 
              stroke="#666"
              fontSize={12}
              label={{ value: 'Match Number', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              label={{ value: 'Points', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="points" 
              stroke="#8884d8" 
              strokeWidth={3}
              dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};