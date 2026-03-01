import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import LLMModelModal from "@/components/cv/LLMModelModal";
import FeedbackModal, { FeedbackData } from "@/components/cv/FeedbackModal";
import ViewFeedbacksModal from "@/components/cv/ViewFeedbacksModal";
import UserRoleModal, { UserRole } from "@/components/cv/UserRoleModal";
import { Card, CardContent } from "@/components/ui/card";
import { ICandidateBase, ICandidate_LLM_Data } from "@/interfaces/ICandidate";
import AIAssessment from "@/components/cv/AIAssessment";
import AISkills from "@/components/cv/AISkills";
import CandidateBasicInfo from "@/components/cv/CandidateBasicInfo";
import ProfileHeader from "@/components/cv/ProfileHeader";
import CandidateCertifications from "@/components/cv/CandidateCertifications";
import CandidateExperience from "@/components/cv/CandidateExperience";

const CandidateProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [llmModalOpen, setLlmModalOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const [selectedModel, setSelectedModel] = useState<"openai" | "ollama" |  null>(null);
    const [resumeData, setResumeData] = useState<ICandidateBase>();
    const [openAIData, setOpenAIData] = useState<ICandidate_LLM_Data>();
    const [ollamaData, setOllamaData] = useState<ICandidate_LLM_Data>();
    const [selectedLLMData, setSelectedLLMData] = useState<ICandidate_LLM_Data>();


    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [viewFeedbacksOpen, setViewFeedbacksOpen] = useState(false);
    const [userRoleModalOpen, setUserRoleModalOpen] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
   

    useEffect(() => {
        if (!id) return;
        const ctrl = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setErr(null);

                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cv/candidate/search/${id}/`, {
                    method: "GET",
                    signal: ctrl.signal,
                });

                console.log("RESPONSE: ", res)
                if (!res.ok) throw new Error(`Failed to load (${res.status})`);
                const json = await res.json();
                console.log("===>", json)
                setResumeData(json)
                
                if(json.openai){
                  setSelectedModel("openai")
                } else if(json.ollama){
                  setSelectedModel("ollama")
                }

                
                setOpenAIData(json.openai)
                setOllamaData(json.ollama)
                
            } catch (e: any) {
                if (e?.name === "AbortError") return;
                setErr(e?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        })();
        return () => ctrl.abort();
    }, [id]);



    const handleLlmConfirm = (model: "openai" | "ollama", _passcode?: string) => {
        setLlmModalOpen(false);
    };

    const updateAIField = <K extends keyof ICandidate_LLM_Data>(key: K, value: ICandidate_LLM_Data[K]) => {
        console.log("AI field Updated --> ", key, value)
        if (selectedModel == "openai" && selectedLLMData) {
            setSelectedLLMData((prev) => ({ ...prev, [key]: value }));
        }
        else if (selectedModel == "ollama" && selectedLLMData) {
            setSelectedLLMData((prev) => ({ ...prev, [key]: value }));
        } else {
            throw "Invalid Model"
        }

    };



    const handleFeedbackSubmit = (feedback: FeedbackData) => {
        setFeedbacks((prev) => [...prev, feedback]);
    };



    useEffect(() => {
        const activeData = selectedModel === "openai" ? openAIData : selectedModel === "ollama" ? ollamaData : null;
        console.log("Selected Model : ", selectedModel, activeData)
        setSelectedLLMData(activeData)
    }, [selectedModel]);







    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--gradient-surface)" }}>
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading profile...
                </div>
            </div>
        );
    }




    if (!resumeData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Candidate not found.</p>
            </div>
        );
    }





    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--gradient-surface)" }}>
            <div className="mx-auto max-w-5xl space-y-6">

                <ProfileHeader
                    navigate={navigate}
                    searchOpen={searchOpen}
                    setSearchOpen={setSearchOpen}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    openLlmModal={() => { setLlmModalOpen(true) }}
                    setFeedbackModalOpen={setFeedbackModalOpen}
                    setViewFeedbacksOpen={setViewFeedbacksOpen}
                    setUserRoleModalOpen={setUserRoleModalOpen}
                    feedbacks={feedbacks}
                />

                <span>{err}</span>


                {/* Profile header */}
                <Card style={{ boxShadow: "var(--shadow-elevated)" }}>
                    <CardContent className="p-6 md:p-8">
                        <CandidateBasicInfo
                            resumeData={resumeData}
                            selectedModel={selectedModel}
                            openAIData={openAIData}
                            ollamaData={ollamaData}
                            onSaveResume={(updated) => setResumeData(updated)}
                            onSaveRankingScore={(model, score) => { updateAIField("ranking_score", score) }}
                            readOnly = {selectedLLMData === null}
                        />
                    </CardContent>
                </Card>

                {/* Ranking reason */}
                <Card>
                    <CardContent className="p-6">
                        <AIAssessment
                            value={selectedLLMData?.ranking_reason ?? null}
                            onSave={(val) => updateAIField("ranking_reason", val)}
                            readOnly={selectedLLMData == null}
                        />
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">

                    <AISkills
                        readOnly={selectedLLMData === null}
                        skills={selectedLLMData?.skills ?? []}
                        onSave={(updatedSkills) => updateAIField("skills", updatedSkills)}
                    />

                    {/* Certifications */}
                    <CandidateCertifications
                        certifications={selectedLLMData?.certifications ?? []}
                        onSave={(updated) => updateAIField("certifications", updated)}
                        readOnly={selectedLLMData == null}
                    />

                </div>

                {/* Experience */}
                <CandidateExperience
                    experiences={selectedLLMData?.experiences ?? []}
                    onSave={(updated) => updateAIField("experiences", updated)}
                    readOnly={selectedLLMData == null}
                />

            </div>

            <LLMModelModal open={llmModalOpen} onClose={() => setLlmModalOpen(false)} onConfirm={handleLlmConfirm} />
            <FeedbackModal open={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} candidateName={resumeData.name} onSubmit={handleFeedbackSubmit} />
            <ViewFeedbacksModal open={viewFeedbacksOpen} onClose={() => setViewFeedbacksOpen(false)} candidateName={resumeData.name} feedbacks={feedbacks} />
            <UserRoleModal open={userRoleModalOpen} onClose={() => setUserRoleModalOpen(false)} currentRole={userRole} onSelect={setUserRole} />
        </div>
    );
};

export default CandidateProfile;
