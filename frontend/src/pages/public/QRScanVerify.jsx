import { useState } from "react";
import QrScanner from "react-qr-scanner";
import { scanAndVerify } from "../../api/verifyApi";

/**
 * QRScanVerify
 * Dedicated page for scanning QR and auto-verifying.
 * Connected to POST /scan
 */
export default function QRScanVerify() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastSerial, setLastSerial] = useState(null);

  async function handleScan(data) {
    if (!data || !data.text) return;

    try {
      let serialNumber = null;

      // Try JSON payload
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

      // Prevent repeated auto-scans of same QR
      if (serialNumber === lastSerial) return;

      setLastSerial(serialNumber);

      console.log("Scanned serial:", serialNumber);

      setLoading(true);
      setError(null);
      setResult(null);

      const response = await scanAndVerify({
        serialNumber,
        location: "QR_SCAN",
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
          QR Scan & Verify
        </h1>
        <p className="text-gray-500 mt-1">
          Scan the QR code on the label to instantly verify authenticity.
        </p>
      </div>

      {/* Scanner Card */}
      <div className="bg-white rounded-xl shadow p-8 space-y-6">

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

        {loading && (
          <p className="text-center text-blue-600 font-medium">
            Verifying scanned QR...
          </p>
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
