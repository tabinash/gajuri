import httpClient from "./http";

export const createJob = async (jobData) => {
  console.log("🚀 Creating job with data:", jobData);

  try {
    const response = await httpClient.post("/jobs/create-job", jobData);
    console.log("🚀 Create Job Response:", response);

    if (!response.success) {
      throw new Error(response.message || "Job creation failed");
    }

    return response;
  } catch (error) {
    console.error("❌ Error creating job:", error);
    throw error;
  }
};

export const getAllJobs = async () => {
  try {
    console.log("🌐 Fetching all jobs from API");
    const response = await httpClient.get("/jobs/all-jobs");
    console.log("🚀 Get All Jobs Response:", response);

    return response;
  } catch (error) {
    console.error("❌ Error fetching all jobs:", error);
    throw error;
  }
};

export const updateJob = async (jobId, jobData) => {
  console.log("🚀 Updating job with ID:", jobId, "Data:", jobData);

  try {
    const response = await httpClient.put(`/jobs/${jobId}`, jobData);
    console.log("🚀 Update Job Response:", response);

    return response;
  } catch (error) {
    console.error("❌ Error updating job:", error);
    throw error;
  }
};

export const deleteJob = async (jobId) => {
  console.log("🚀 Deleting job with ID:", jobId);

  try {
    const response = await httpClient.delete(`/jobs/${jobId}`);
    console.log("🚀 Delete Job Response:", response);

    return response;
  } catch (error) {
    console.error("❌ Error deleting job:", error);
    throw error;
  }
};

export const getJobByUserId = async (userId) => {
  try {
    console.log("🌐 Fetching jobs from API for user:", userId);
    const response = await httpClient.get(`/jobs/user/${userId}`);
    console.log("🚀 My Jobs Response:", response);

    return response;
  } catch (error) {
    console.error(`❌ Error fetching jobs for user ${userId}:`, error);
    throw error;
  }
};

export const jobClosed = async (jobId) => {
  console.log("🚀 Marking job as closed with ID:", jobId);

  try {
    const response = await httpClient.patch(`/jobs/${jobId}/close`);
    console.log("🚀 Close Job Response:", response);

    return response;
  } catch (error) {
    console.error("❌ Error closing job:", error);
    throw error;
  }
};
