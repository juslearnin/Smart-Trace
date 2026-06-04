import { useState } from "react";
import { scanAndVerify } from "../../api/verifyApi";
import QrScanner from "react-qr-scanner";

/**
 * ScanVerify
 * Public page to scan and verify a serial number.
 * Connected to POST /scan
 */
export default function ScanVerify() {
  const [form, setForm] = useState({
    serialNumber: "",
    location: "",
    verificationCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  async function handleScan(data) {
  if (!data || !data.text) return;

  try {
    let serialNumber = null;

    // Try JSON payload first
    try {
      const parsed = JSON.parse(data.text);

      if (parsed.serialNumber) {
        serialNumber = parsed.serialNumber;
      } else if (parsed.serial) {
        serialNumber = parsed.serial;   // your current QR format
      }

    } catch (e) {
      // Plain text QR
      serialNumber = data.text;
    }

    if (!serialNumber) {
      console.warn("QR does not contain a valid serial field");
      return;
    }

    console.log("Scanned serial:", serialNumber);

    // Fill the form
    setForm(prev => ({
      ...prev,
      serialNumber
    }));

    // Close scanner
    setShowScanner(false);

    // 🔥 AUTO VERIFY AFTER SCAN
    setLoading(true);
    setError(null);
    setResult(null);

    const response = await scanAndVerify({
      serialNumber,
      location: form.location || "QR_SCAN",
      verificationCode: ""
    });

    setResult(response);

  } catch (err) {
    console.error("QR scan verification failed:", err);
    setError("Failed to verify scanned QR.");
  } finally {
    setLoading(false);
  }
}

function handleError(err) {
  console.error("QR Scanner Error:", err);
}


  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await scanAndVerify({
        serialNumber: form.serialNumber,
        location: form.location,
        verificationCode: form.verificationCode,
      });

      setResult(data);
    } catch (err) {
      console.error("Scan error:", err);
      setError("Failed to verify serial number.");
    } finally {
      setLoading(false);
    }
  }

  function getStatusStyles(status) {
    switch (status) {
      case "VALID":
        return "bg-green-100 text-green-800 border-green-300";
      case "SUSPECT":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "INVALID":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Scan & Verify Product
        </h1>
        <p className="text-gray-500 mt-1">
          Enter the serial number to verify authenticity and trace history.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow p-8 space-y-6">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Serial Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial Number
            </label>
            <input
              type="text"
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 font-mono"
              placeholder="Scan or enter serial number"
            />
          </div>

          {/* Location (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location 
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="e.g. Delhi, Mumbai, Store #12"
            />
          </div>

          {/* Verification Code (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code (Optional)
            </label>
            <input
              type="text"
              name="verificationCode"
              value={form.verificationCode}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 font-mono"
              placeholder="First 8 chars printed on label"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Verifying..." : "Verify Product"}
          </button>

          <button
            type="button"
            onClick={() => setShowScanner(prev => !prev)}
            className="w-full border border-blue-200 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            {showScanner ? "Close QR Scanner" : "Open QR Scanner"}
          </button>
        </form>

        {showScanner && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%" }}
              constraints={{
                video: { facingMode: "environment" }
              }}
            />
            <p className="text-sm text-gray-500 mt-3 text-center">
              Point your camera at the QR code on the product label.
            </p>
          </div>
        )}
      </div>

      {/* Result Panel */}
      {result && (
        <div
          className={`border rounded-xl p-6 space-y-3 ${getStatusStyles(result.status)}`}
        >
          <h2 className="text-xl font-bold">
            Status: {result.status}
          </h2>

          <p className="font-semibold">
            {result.message}
          </p>

          {/* Show details if available */}
          {result.productCode && (
            <p>
              <span className="font-medium">Product Code:</span>{" "}
              <span className="font-mono">{result.productCode}</span>
            </p>
          )}

          {result.level && (
            <p>
              <span className="font-medium">Packaging Level:</span>{" "}
              {result.level}
            </p>
          )}

          {result.scanCount && (
            <p>
              <span className="font-medium">Scan Count:</span>{" "}
              {result.scanCount}
            </p>
          )}

          {result.locations && (
            <div>
              <p className="font-medium mb-1">Detected Locations:</p>
              <ul className="list-disc ml-6 text-sm">
                {result.locations.map((loc, idx) => (
                  <li key={idx}>{loc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error Panel */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
