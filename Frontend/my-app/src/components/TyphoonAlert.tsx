import React from "react";

type TyphoonAlertData = {
  riskClassification: string;
  typhoonCategory: string;
  shelterMessage: string;
};

// Hardcoded example data for Typhoon Alert
const sampleTyphoonAlertData: TyphoonAlertData = {
  riskClassification: "Low",
  typhoonCategory: "Category 1",
  shelterMessage: "No immediate action required, continue with daily activities.",
};

const TyphoonAlert: React.FC = () => {
  const data = sampleTyphoonAlertData;

  return (
    <div>
      <p>Risk of Typhoon: {data.riskClassification}</p>
      <p>Typhoon Category: {data.typhoonCategory}</p>
      <p>Action to Take: {data.shelterMessage}</p>
    </div>
  );
};

export default TyphoonAlert;



// import React from "react";

// type TyphoonAlertProps = {
//   riskClassification: string;
//   typhoonCategory: string;
//   shelterMessage: string;
// };


// const TyphoonAlert: React.FC<TyphoonAlertProps> = ({
//   riskClassification,
//   typhoonCategory,
//   shelterMessage,
  
// }) => {
//   return (
//     <div className="bg-[#1A2738] text-white p-4 rounded-lg space-y-2">
//       <h3 className="text-lg font-semibold">Typhoon Alert</h3>
//       <p><strong>Risk of Typhoon:</strong> {riskClassification}</p>
//       <p><strong>Typhoon Category:</strong> {typhoonCategory}</p>
//       <p><strong>Action to take:</strong> {shelterMessage}</p>
//     </div>
//   );
// };

// export default TyphoonAlert;
