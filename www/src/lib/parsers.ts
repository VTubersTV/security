// CVSS Vector Parser
// Maps for CVSS metrics and their human-readable values
const CVSS_METRICS = {
  AV: {
    N: "Network",
    A: "Adjacent Network",
    L: "Local",
    P: "Physical"
  },
  AC: {
    L: "Low",
    H: "High"
  },
  PR: {
    N: "None",
    L: "Low",
    H: "High"
  },
  UI: {
    N: "None",
    R: "Required"
  },
  S: {
    U: "Unchanged",
    C: "Changed"
  },
  C: {
    N: "None",
    L: "Low",
    H: "High"
  },
  I: {
    N: "None",
    L: "Low",
    H: "High"
  },
  A: {
    N: "None",
    L: "Low",
    H: "High"
  }
} as const;

// Type definitions
type CVSSMetric = keyof typeof CVSS_METRICS;
type CVSSValue<T extends CVSSMetric> = keyof typeof CVSS_METRICS[T];

interface CVSSDetails {
  version: string;
  attackVector: string;
  attackComplexity: string;
  privilegesRequired: string;
  userInteraction: string;
  scope: string;
  confidentialityImpact: string;
  integrityImpact: string;
  availabilityImpact: string;
}

interface CVSSResult {
  str: string;
  details: CVSSDetails;
}

/**
 * Parses a CVSS vector string into a human-readable format and structured data
 * @param vector CVSS vector string (e.g. "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H")
 * @returns Object containing human-readable string and structured details
 */
export function cveVector(vector: string): CVSSResult {
  // Validate vector format
  if (!vector.startsWith("CVSS:")) {
    throw new Error("Invalid CVSS vector format");
  }

  // Split vector into components
  const [version, ...metrics] = vector.split("/");
  const cvssVersion = version.split(":")[1];

  // Parse metrics into object
  const details: Partial<CVSSDetails> = {
    version: cvssVersion
  };

  const metricStrings: string[] = [];

  for (const metric of metrics) {
    const [key, value] = metric.split(":") as [CVSSMetric, string];
    
    if (key in CVSS_METRICS && value in CVSS_METRICS[key]) {
      const humanReadable = CVSS_METRICS[key][value as CVSSValue<typeof key>];
      
      // Map to detail property names
      switch (key) {
        case "AV": details.attackVector = humanReadable; break;
        case "AC": details.attackComplexity = humanReadable; break;
        case "PR": details.privilegesRequired = humanReadable; break;
        case "UI": details.userInteraction = humanReadable; break;
        case "S": details.scope = humanReadable; break;
        case "C": details.confidentialityImpact = humanReadable; break;
        case "I": details.integrityImpact = humanReadable; break;
        case "A": details.availabilityImpact = humanReadable; break;
      }

      // Build human readable string
      metricStrings.push(`${getMetricName(key)}: ${humanReadable}`);
    }
  }

  // Create human readable string
  const str = `CVSS ${cvssVersion} - ${metricStrings.join(", ")}`;

  return {
    str,
    details: details as CVSSDetails
  };
}

// Helper function to get human-readable metric names
function getMetricName(metric: CVSSMetric): string {
  const names: Record<CVSSMetric, string> = {
    AV: "Attack Vector",
    AC: "Attack Complexity",
    PR: "Privileges Required",
    UI: "User Interaction",
    S: "Scope",
    C: "Confidentiality Impact",
    I: "Integrity Impact",
    A: "Availability Impact"
  };
  return names[metric];
}
