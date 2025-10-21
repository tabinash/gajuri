"use client";

import React, { useEffect, useState } from "react";
import { getAllJobs } from "@/repositories/JobRepository";

const LocalJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {


    try {
      const response = await getAllJobs();
      console.log("API Response:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch jobs");
      }

      setJobs(response.data || []);
      console.log("XYZ Success: Jobs fetched successfully!");
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err.message);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div>
      {isLoading && <p>Loading jobs...</p>}
      {error && <p>Error: {error}</p>}
      {!isLoading && !error && jobs.length > 0 && (
        <p>{jobs.length} jobs fetched successfully!</p>
      )}
    </div>
  );
};

export default LocalJobs;
