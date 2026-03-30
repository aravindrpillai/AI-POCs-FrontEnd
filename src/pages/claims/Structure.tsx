import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const SAMPLE_STRUCTURE = `
{
  "summary": "true",
  "data": {
    "what_happened": "",
    "incident_date": "",
    "incident_location": "",

    "parties_involved": [
      {
        "name": "",
        "role": "",
        "phone": "",
        "email": "",
        "injury": ""
      }
    ],

    "vehicle_number": "",
    "other_vehicle_number": "",

    "contact_details": [
      {
        "name": "",
        "phone": "",
        "email": ""
      }
    ],

    "police_fir_number": "",
    "policy_number": "",

    "severity": 1-10,
    "genuinity_score": 1-10,
    "genuinity_rationale": "POSITIVE INDICATORS: ...\nRED FLAGS: ...\nIMAGE ANALYSIS: ...\nRECOMMENDATION: ...",

    "images": [
      {
        "filename": "",
        "description": "",
        "vehicle_match": true,
        "plate_match": true,
        "damage_consistent": true,
        "flags": []
      }
    ],

    "damage_map": {
      "is_collision": true,
      "damages": [
        {
          "view": "front | rear | side_left | side_right | top",
          "zones": ["bumper", "hood", "fender", "front_door", "rear_door", "quarter_panel", "roof", "trunk", "windshield", "pillar"]
        }
      ]
    },

    "ai_images": []
  }
}

`.trim()

const Structure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 md:px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/claims")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Claims
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 md:px-8 py-8 w-full">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2">Response Structure</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          This is the JSON structure returned by the Claims AI after processing a claim.
        </p>
        <div className="w-full md:w-[80%] flex-1 min-h-0">
          <ScrollArea className="w-full h-[400px] md:h-[500px] rounded-xl border border-border bg-white dark:bg-white/95">
            <pre className="p-6 text-sm font-mono text-foreground whitespace-pre-wrap break-words">
              {SAMPLE_STRUCTURE}
            </pre>
          </ScrollArea>
        </div>
      </main>
    </div>
  );
};

export default Structure;
