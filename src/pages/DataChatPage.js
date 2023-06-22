import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import DataGrid from 'react-data-grid';
import Swal from 'sweetalert2';
import { BlobServiceClient } from '@azure/storage-blob';
import { FaHome } from 'react-icons/fa';

const DataChatPage = () => {
  const [csvData, setCsvData] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedCsvData, setUploadedCsvData] = useState([]);
  const [connectedStatus, setConnectedStatus] = useState('');
  const [blobName, setBlobName] = useState('');

  useEffect(() => {
    fetch('https://api.mosiai.studio/connected')
      .then(response => response.text())
      .then(data => {
        setConnectedStatus(data);
      })
      .catch(error => {
        console.error('Error fetching server status:', error);
      });
  }, []);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleAnalysis = () => {
    if (!prompt || !blobName) {
      Swal.fire('Please enter a prompt and upload a file');
      return;
    }

    setIsLoading(true);

    fetch('https://api.mosiai.studio/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, blobName })
    })
      .then(response => response.json())
      .then(data => {
        setResult(data.result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('An error occurred during analysis:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!'
        });
        setIsLoading(false);
      });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    setBlobName(`mosicsv/${file.name}`);

    try {
      setIsLoading(true);

      
      // You should replace this string with your Blob SAS URL
      const sasUrl = ""
      const blobServiceClient = new BlobServiceClient(sasUrl);
      const containerClient = blobServiceClient.getContainerClient('mosicsv');
      const blockBlobClient = containerClient.getBlockBlobClient(file.name);

      Swal.fire({
        title: 'Uploading...',
        html: 'Please wait...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await blockBlobClient.uploadData(file, {
        onProgress: (progress) => {
          const progressPercentage = Math.round((progress.loadedBytes / progress.totalBytes) * 100);
          Swal.update({
            title: 'Uploading...',
            html: `Please wait... (${progressPercentage}%)`
          });
        }
      });

      Swal.close();

      Swal.fire('Success!', 'File uploaded successfully', 'success');

      const uploadedCsvData = await fetchAndParseCsvFromAzureBlob(blockBlobClient.url);
      setUploadedCsvData(uploadedCsvData);
      setIsLoading(false);
    } catch (error) {
      console.error('An error occurred during file upload:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!'
      });
      setIsLoading(false);
    }
  };

  const fetchAndParseCsvFromAzureBlob = async (csvUrl) => {
    try {
      const response = await fetch(csvUrl);

      if (!response.ok) {
        throw new Error(`Error downloading CSV file: ${response.status} - ${response.statusText}`);
      }

      const csvText = await response.text();
      const parsedData = Papa.parse(csvText, { header: true }).data;

      return parsedData;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  const goBack = () => {
    // Implement your goBack logic here
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="mb-4">
        <h1 className="text-4xl font-bold">Data Chat <span className="text-sm font-normal text-red-500">(Beta)</span></h1>
      </div>
      <div className="mb-6">
        <p className="text-green-500 mb-2">Server Status: {connectedStatus}</p>
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2" htmlFor="prompt">
          Prompt
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="prompt"
          type="text"
          placeholder="Enter the prompt"
          value={prompt}
          onChange={handlePromptChange}
        />
      </div>

      <div className="mb-6">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAnalysis}
        >
          Analyze
        </button>
      </div>

      {isLoading && (
        <div className="text-center">
          <p className="text-gray-500">Analyzing data...</p>
          <div className="mt-2">
            {/* Add your loading animation here */}
          </div>
        </div>
      )}

      {result && !isLoading && (
        <div className="bg-gray-200 p-4 mt-6">
          <h2 className="text-lg font-bold mb-2">Analysis Result:</h2>
          <p>{result}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2" htmlFor="csv-file">
          Upload CSV
        </label>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>

      {/* If there is uploaded CSV data, display it in a data grid */}
      {uploadedCsvData.length > 0 && (
        <div style={{ height: 600, width: '100%' }}>
          <table className="table-auto">
            <thead>
              <tr>
                {Object.keys(uploadedCsvData[0]).map((key, index) => (
                  <th key={index} className="px-4 py-2 bg-gray-200">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uploadedCsvData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, index) => (
                    <td key={index} className="border px-4 py-2">{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={goBack}
      >
        <FaHome className="mr-2" /> Back
      </button>
    </div>
  );
};

export default DataChatPage;