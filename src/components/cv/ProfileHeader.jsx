import {
  Home,
  Search,
  RefreshCw,
  MessageSquarePlus,
  MessageSquare,
  UserCircle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import CandidateSearchBar from "@/components/cv/CandidateSearchBar";

const ProfileHeader = ({
  navigate,
  searchOpen,
  setSearchOpen,
  selectedModel,
  setSelectedModel,
  openLlmModal,
  setFeedbackModalOpen,
  setViewFeedbacksOpen,
  setUserRoleModalOpen,
  feedbacks,
}) => {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {/* Home */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => navigate("/")}
      >
        <Home className="h-4 w-4" />
      </Button>

      {searchOpen ? (
        <div className="relative flex items-center gap-1.5 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <CandidateSearchBar />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setSearchOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1" />

          {/* Model selector */}
          <ToggleGroup
            type="single"
            value={selectedModel}
            onValueChange={(v) => {
              if (!v) return;
              setSelectedModel(v);
            }}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <ToggleGroupItem
              value="ollama"
              className="text-xs px-1.5 sm:px-2 h-9"
            >
              🦙
              <span className="hidden sm:inline ml-1">Ollama</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="openai"
              className="text-xs px-1.5 sm:px-2 h-9"
            >
              🤖
              <span className="hidden sm:inline ml-1">OpenAI</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="flex-1" />

          {/* Actions */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5"
            onClick={() => setSearchOpen(true)}
            title="Search"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5"
            onClick={() => openLlmModal("reload")}
            title="Reload"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Reload</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5"
            onClick={() => setFeedbackModalOpen(true)}
            title="Feedback"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span className="hidden sm:inline">Feedback</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5 relative"
            onClick={() => setViewFeedbacksOpen(true)}
            title="Feedbacks"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Feedbacks</span>

            {feedbacks?.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {feedbacks.length}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5"
            onClick={() => setUserRoleModalOpen(true)}
            title="User Role"
          >
            <UserCircle className="h-4 w-4" />
            <span className="hidden sm:inline">User</span>
          </Button>
        </>
      )}
    </div>
  );
};
export default ProfileHeader;
