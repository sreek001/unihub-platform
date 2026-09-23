const PrintModel = require('./print.model');

// 📄 Submit a new print job
const createPrintJob = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF document.',
      });
    }

    const studentName = req.body.studentName || 'Student User';
    const copies = parseInt(req.body.copies, 10) || 1;
    const printType = req.body.printType || 'B&W';
    const layout = req.body.layout || 'Single Side';
    const pageCount = req.body.pageCount ? parseInt(req.body.pageCount, 10) : 1;

    const fileName = req.file.filename || req.file.originalname;
    const fileUrl = `/uploads/${fileName}`;

    // Pricing: B&W = ₹2/page, Color = ₹5/page
    const ratePerCopy = printType === 'Color' ? 5 : 2;
    const price = pageCount * ratePerCopy * copies;

    // Save job
    const savedJob = await PrintModel.insertJob(
      studentName,
      fileName,
      fileUrl,
      pageCount,
      copies,
      printType,
      layout,
      price
    );

    return res.status(200).json({
      success: true,
      message: 'Print request submitted successfully',
      request: savedJob,
      order: savedJob,
    });
  } catch (error) {
    console.error('❌ CREATE PRINT JOB ERROR:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit print request.',
    });
  }
};

// 📋 Fetch all print jobs
const getPrintHistory = async (req, res) => {
  try {
    const jobs = await PrintModel.getAllJobs();

    return res.status(200).json({
      success: true,
      message: 'Print history fetched successfully.',
      jobs: jobs || [],
      requests: jobs || [],
    });
  } catch (error) {
    console.error('❌ GET HISTORY ERROR:', error);
    return res.status(200).json({
      success: true,
      message: 'Error fetching print history.',
      jobs: [],
      requests: [],
    });
  }
};

// 🔄 Update print job status
const updatePrintJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.',
      });
    }

    const updatedJob = await PrintModel.updateJobStatus(id, status);

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: 'Print job not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Print job status updated successfully.',
      job: updatedJob,
      request: updatedJob,
    });
  } catch (error) {
    console.error('❌ UPDATE STATUS ERROR:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update status.',
    });
  }
};

module.exports = {
  createPrintJob,
  getPrintHistory,
  updatePrintJobStatus,
};