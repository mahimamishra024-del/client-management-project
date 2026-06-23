import axios from "axios";
import db from "../config/db.js";

const TALLY_URL = "http://localhost:9999";

export const testTallyConnection = async () => {
  try {
    const response = await axios.post(
      TALLY_URL,
      `<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER><BODY><EXPORTDATA><REQUESTDESC><REPORTNAME>System : Master Companies</REPORTNAME></REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>`,
      { timeout: 1500 }
    );
    return response.status === 200 ? { success: true } : { success: false };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const createLedgerInTally = async (companyName) => {
  const xml = `
    <ENVELOPE>
      <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
      <BODY>
        <IMPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>All Masters</REPORTNAME>
            <STATICVARIABLES><SVCOMPANYNAME>Saarthi360</SVCOMPANYNAME></STATICVARIABLES>
          </REQUESTDESC>
          <REQUESTDATA>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
              <LEDGER NAME="${companyName}" ACTION="Create">
                <NAME>${companyName}</NAME>
                <PARENT>Sundry Debtors</PARENT>
                <ISBILLWISEON>YES</ISBILLWISEON>
                <AFFECTSSTOCK>NO</AFFECTSSTOCK>
              </LEDGER>
            </TALLYMESSAGE>
          </REQUESTDATA>
        </IMPORTDATA>
      </BODY>
    </ENVELOPE>`;

  try {
    const response = await axios.post(TALLY_URL, xml, {
      headers: { "Content-Type": "text/xml" },
      timeout: 5000,
    });
    const raw = response.data || "";
    console.log(`📋 Ledger response for ${companyName}:`, raw.substring(0, 150));
    return { success: true };
  } catch (err) {
    console.error(`❌ Ledger creation failed for ${companyName}:`, err.message);
    return { success: false, error: err.message };
  }
};

// Converts any date format to Tally's required YYYYMMDD format
const formatDateForTally = (d) => {
  if (!d) return "";

  // If it's already a Date object (MySQL returns these)
  if (d instanceof Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const result = `${y}${m}${day}`;
    console.log(`🗓️ Date object → ${result}`);
    return result;
  }

  // If it's a string like "2026-06-23"
  if (typeof d === "string") {
    const clean = d.includes("T") ? d.split("T")[0] : d;
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const result = clean.replace(/-/g, "");
      console.log(`🗓️ Date string → ${result}`);
      return result;
    }
  }

  // Fallback
  const dt = new Date(d);
  if (isNaN(dt.getTime())) {
    console.log(`🗓️ Date invalid → empty`);
    return "";
  }
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  const result = `${y}${m}${day}`;
  console.log(`🗓️ Date fallback → ${result}`);
  return result;
};

export const buildVoucherXML = (voucherData) => {
  console.log("🗓️ bill_date raw:", voucherData.bill_date, "| type:", typeof voucherData.bill_date, "| isDate:", voucherData.bill_date instanceof Date);

  const baseAmount = parseFloat(voucherData.bill_amount) || 0;
  const gstAmount = Math.round(baseAmount * 0.18);
  const totalAmount = baseAmount + gstAmount;
  const formattedDate = formatDateForTally(voucherData.bill_date);

  console.log("🗓️ Final formatted date for Tally:", formattedDate);

  return `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCOMPANYNAME>Saarthi360</SVCOMPANYNAME>
          <SVCURRENTDATE>${formattedDate}</SVCURRENTDATE>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>${formattedDate}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${voucherData.bill_no || ""}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${voucherData.companyName || "Client Name"}</PARTYLEDGERNAME>
            <NARRATION>${voucherData.remarks || "Placement Fees"}</NARRATION>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${voucherData.companyName || "Client Name"}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${totalAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${baseAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output GST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${gstAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
};

export const createSalesLedgers = async () => {
  const salesXml = `
    <ENVELOPE>
      <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
      <BODY>
        <IMPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>All Masters</REPORTNAME>
            <STATICVARIABLES><SVCOMPANYNAME>Saarthi360</SVCOMPANYNAME></STATICVARIABLES>
          </REQUESTDESC>
          <REQUESTDATA>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
              <LEDGER NAME="Sales" ACTION="Create">
                <NAME>Sales</NAME>
                <PARENT>Sales Accounts</PARENT>
              </LEDGER>
              <LEDGER NAME="Output GST" ACTION="Create">
                <NAME>Output GST</NAME>
                <PARENT>Duties &amp; Taxes</PARENT>
                <TAXTYPE>GST</TAXTYPE>
              </LEDGER>
            </TALLYMESSAGE>
          </REQUESTDATA>
        </IMPORTDATA>
      </BODY>
    </ENVELOPE>`;
  try {
    await axios.post(TALLY_URL, salesXml, { headers: { "Content-Type": "text/xml" }, timeout: 5000 });
    console.log("✅ Sales and Output GST ledgers ready");
  } catch (err) {
    console.warn("⚠️ Sales ledger creation:", err.message);
  }
};

export const pushToTally = async (voucherData) => {
  try {
    await createSalesLedgers();
    await createLedgerInTally(voucherData.companyName || "Client");

    const xmlPayload = buildVoucherXML(voucherData);
    const response = await axios.post(TALLY_URL, xmlPayload, {
      headers: { "Content-Type": "text/xml" },
      timeout: 5000,
    });

    const raw = response.data || "";
    console.log("📨 Tally voucher response:", raw.substring(0, 300));

    const hasLineError = raw.includes("<LINEERROR>");
    if (!hasLineError) {
      console.log(`✅ Tally push success for: ${voucherData.companyName}`);
      return { success: true };
    }

    const errorMatch = raw.match(/<LINEERROR>([\s\S]*?)<\/LINEERROR>/i);
    const errorMsg = errorMatch ? errorMatch[1].trim() : "Tally rejected the voucher";
    console.warn(`❌ Tally push failed for ${voucherData.companyName}: ${errorMsg}`);
    return { success: false, error: errorMsg, raw };

  } catch (err) {
    console.error("❌ Tally push error:", err.message);
    return { success: false, error: err.message };
  }
};

export const fetchVouchersFromTally = async () => {
  try {
    console.log("📤 Fetching Day Book from Tally...");

    const payload = `
      <ENVELOPE>
        <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Day Book</REPORTNAME>
              <STATICVARIABLES>
                <SVCOMPANYNAME>Saarthi360</SVCOMPANYNAME>
                <SVFROMDATE>20240401</SVFROMDATE>
                <SVTODATE>20301231</SVTODATE>
              </STATICVARIABLES>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>`;

    const response = await axios.post(TALLY_URL, payload, {
      headers: { "Content-Type": "text/xml" },
      timeout: 15000,
    });

    if (!response.data) return [];

    const voucherRegex = /<VOUCHER[\s\S]*?<\/VOUCHER>/gi;
    const rawVoucherBlocks = response.data.match(voucherRegex);

    if (!rawVoucherBlocks || rawVoucherBlocks.length === 0) {
      console.log("⚠️ No voucher blocks found in Tally response.");
      return [];
    }

    console.log(`📊 Matched ${rawVoucherBlocks.length} voucher blocks.`);
    const vouchers = [];

    for (const block of rawVoucherBlocks) {
      const vTypeMatch = block.match(/<(?:VOUCHERTYPENAME|VCHTYPE)>([\s\S]*?)<\/(?:VOUCHERTYPENAME|VCHTYPE)>/i);
      const vType = String(vTypeMatch ? vTypeMatch[1] : "").toLowerCase();
      if (!vType.includes("sales")) continue;

      const billNoMatch = block.match(/<(?:VOUCHERNUMBER|REFERENCE)>([\s\S]*?)<\/(?:VOUCHERNUMBER|REFERENCE)>/i);
      const billNo = String(billNoMatch ? billNoMatch[1] : "").trim();

      const narrationMatch = block.match(/<NARRATION>([\s\S]*?)<\/NARRATION>/i);
      const narration = String(narrationMatch ? narrationMatch[1] : "").trim();

      const partyMatch = block.match(/<PARTYLEDGERNAME>([\s\S]*?)<\/PARTYLEDGERNAME>/i);
      const companyName = String(partyMatch ? partyMatch[1] : "").trim();

      let amount = 0;
      let maxAmt = 0;
      const allLedgerRegex = /<ALLLEDGERENTRIES\.LIST>([\s\S]*?)<\/ALLLEDGERENTRIES\.LIST>/gi;
      const ledgerRegex = /<LEDGERENTRIESLIST>([\s\S]*?)<\/LEDGERENTRIESLIST>/gi;

      const processLedger = (ledgerContent) => {
        const amtMatch = ledgerContent.match(/<AMOUNT>([\s\S]*?)<\/AMOUNT>/i);
        const positiveMatch = ledgerContent.match(/<ISDEEMEDPOSITIVE>([\s\S]*?)<\/ISDEEMEDPOSITIVE>/i);
        const isPositive = String(positiveMatch ? positiveMatch[1] : "").trim().toLowerCase() === "yes";
        const rawAmt = Math.abs(parseFloat(amtMatch ? amtMatch[1] : 0)) || 0;
        if (isPositive && rawAmt > 0 && amount === 0) amount = rawAmt;
        if (rawAmt > maxAmt) maxAmt = rawAmt;
      };

      let lb;
      while ((lb = allLedgerRegex.exec(block)) !== null) processLedger(lb[1]);
      while ((lb = ledgerRegex.exec(block)) !== null) processLedger(lb[1]);
      if (amount === 0) amount = maxAmt;

      if (billNo || companyName) {
        vouchers.push({
          billNo: billNo.replace(/[^A-Za-z0-9-]/g, ""),
          companyName,
          baseAmount: amount,
          remarks: narration,
        });
      }
    }

    console.log(`✅ Found ${vouchers.length} Sales vouchers.`);
    return vouchers;
  } catch (err) {
    console.error("❌ Tally fetch error:", err.message);
    return [];
  }
};

export const pushAllClosedToTally = async (rows = null) => {
  try {
    let data = rows;
    if (!data) {
      const [fetchedRows] = await db.query(
        "SELECT * FROM clients WHERE (billingStatus = 'closed' OR billingStatus = 'invoiced') AND tally_pushed = 0"
      );
      data = fetchedRows;
    }

    if (!data || data.length === 0) {
      return { success: true, pushed: 0, message: "No pending items" };
    }

    let successCount = 0;
    let failedCount = 0;

    for (const row of data) {
      if (!row.bill_amount) { failedCount++; continue; }
      const result = await pushToTally(row);
      if (result.success) {
        await db.query("UPDATE clients SET tally_pushed = 1 WHERE id = ?", [row.id]);
        successCount++;
      } else {
        failedCount++;
      }
    }

    return { success: true, pushed: successCount, failed: failedCount };
  } catch (err) {
    console.error("Push All Error:", err.message);
    return { success: false, error: err.message };
  }
};