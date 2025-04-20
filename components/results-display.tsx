"use client";

import { CatButton } from "@/components/cat-button";
import { PawPrint } from "@/components/paw-print";
import { RandomCat } from "@/components/random-cat";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-context";
import { ANIMAL_TYPES } from "@/lib/constants";
import { createClient } from "@/lib/supabase-client";
import type { ImageData, VoteStats } from "@/lib/types";
import type { UserProfile } from "@/lib/user-service";
import { capitalize } from "@/lib/utils";
import {
  AlertCircle,
  Check,
  Copy,
  ImageIcon,
  LockIcon,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { RefreshCw } from "lucide-react";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ResultsDisplayProps {
  imageData: ImageData;
  uploaderProfile: UserProfile | null;
  initialVote?: "animal" | "human" | null;
  initialVoteStats?: VoteStats;
}

export default function ResultsDisplay({
  imageData,
  uploaderProfile,
  initialVote = null,
  initialVoteStats = {
    animalVotes: 0,
    humanVotes: 0,
    animalPercentage: 0,
    humanPercentage: 0,
    totalVotes: 0,
  },
}: ResultsDisplayProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voted, setVoted] = useState(!!initialVote);
  const [voteStats, setVoteStats] = useState<VoteStats>(initialVoteStats);
  const [showCelebration, setShowCelebration] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrlRef = useRef<HTMLInputElement>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [humanImageLoaded, setHumanImageLoaded] = useState(false);
  const [animalImageLoaded, setAnimalImageLoaded] = useState(false);
  const [originalImageLoaded, setOriginalImageLoaded] = useState(false);
  const [userVote, setUserVote] = useState<"animal" | "human" | null>(
    initialVote,
  );
  const [isPrivate, setIsPrivate] = useState(imageData?.private || false);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const { requireAuth } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);

      // Set up auth state change listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setIsAuthenticated(!!session);
        },
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    checkAuth();
  }, []);

  // Check if user has already voted when component mounts
  useEffect(() => {
    const checkExistingVote = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch(`/api/vote?imageId=${imageData.id}`);
        const data = await response.json();

        if (response.ok && data.vote) {
          setUserVote(data.vote);
          setVoted(true);
          setVoteStats(data.voteStats);
        }
      } catch (err) {
        console.error("Error checking existing vote:", err);
      }
    };

    checkExistingVote();
  }, [isAuthenticated, imageData.id]);

  // Update the notification permission request
  useEffect(() => {
    const requestNotificationPermission = async () => {
      // Only request for the uploader
      if (!imageData.isUploader || !isAuthenticated) return;

      // Check if notifications are supported
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
      }

      // Check if permission is already granted
      if (Notification.permission === "granted") {
        return;
      }

      // Check if permission is denied
      if (Notification.permission === "denied") {
        console.log("Notification permission has been denied");
        return;
      }

      // Show the explanation modal first
      setShowNotificationModal(true);
    };

    requestNotificationPermission();
  }, [imageData.isUploader, isAuthenticated]);

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      setShowNotificationModal(false);

      if (permission === "granted") {
        console.log("Notification permission granted");
        toast.success("You'll get notified when someone votes on your image!");
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      toast.error("Failed to enable notifications");
    }
  };

  // Add the modal component before the return statement
  const NotificationModal = () => (
    <Dialog
      open={showNotificationModal}
      onOpenChange={setShowNotificationModal}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Enable Vote Notifications 🔔
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-4">
            <p>
              Would you like to receive notifications when others vote on your
              uploads?
            </p>
            <p className="font-medium text-rose-600">
              You'll only get notifications for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>New votes on your uploaded images</li>
              <li>No spam or marketing messages</li>
              <li>You can disable notifications anytime</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowNotificationModal(false)}
          >
            Maybe Later
          </Button>
          <Button
            type="button"
            className="bg-rose-500 hover:bg-rose-600"
            onClick={handleEnableNotifications}
          >
            Enable Notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Destructure imageData for easier access
  const {
    id: imageId,
    animated_url: animatedUrl,
    opposite_url: oppositeUrl,
    image_type: type,
    original_url: originalUrl,
    //uploader_id: uploaderId,
    target_animal_type: targetAnimalType,
    hasVotes,
    isUploader,
  } = imageData;

  const handleVote = async (vote: "animal" | "human") => {
    setLoading(true);
    setError(null);

    // Check if user is authenticated
    if (!isAuthenticated) {
      setLoading(false);

      // Open auth modal with current path as redirect URL
      requireAuth(() => {});
      return;
    }

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId, vote }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && data.requireAuth) {
          // If somehow we still get auth error, open auth modal
          setError("Please sign in to vote");
          localStorage.setItem(
            "pendingVote",
            JSON.stringify({
              imageId,
              vote,
              redirectUrl: window.location.href,
            }),
          );
          requireAuth(() => {});
          return;
        }
        throw new Error(data.error || "Failed to submit vote");
      }

      setUserVote(vote);
      setVoted(true);
      if (data.voteStats) {
        setVoteStats(data.voteStats);
      }
      setShowCelebration(true);

      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    if (shareUrlRef.current) {
      shareUrlRef.current.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/results/${imageId}`
      : `/results/${imageId}`;

  // Add a function to handle regeneration
  const handleRegenerate = async (selectedAnimal: string) => {
    try {
      setRegenerating(true);
      const response = await fetch("/api/regenerate-opposite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: imageData.id,
          newType: selectedAnimal,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate image");
      }

      const data = await response.json();

      // Check if we have a valid image ID in the response
      if (!data.image?.id) {
        throw new Error("No image ID received from server");
      }

      // Redirect to the new results page with the image ID
      router.push(`/results/${data.image.id}`);
    } catch (error) {
      console.error("Error regenerating image:", error);
      toast.error("Failed to regenerate image");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDeleteImage = async () => {
    // Confirm before deletion
    if (
      !window.confirm(
        "Are you sure you want to delete this image? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/delete-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      const data = await response.json();
      console.debug("DELETE images", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete image");
      }

      // Redirect to homepage after successful deletion
      router.push(`/gallery?deleted=${imageId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!uploaderProfile) return "Anonymous";

    if (uploaderProfile.display_name) return uploaderProfile.display_name;

    if (uploaderProfile.email) {
      // Extract first part of email before @ symbol
      const emailName = uploaderProfile.email.split("@")[0];
      return emailName;
    }

    return "Anonymous";
  };

  const handleTogglePrivacy = async () => {
    if (!imageId) return;

    setPrivacyLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/toggle-privacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      const data = await response.json();
      console.log("handleTogglePrivacy response:", { data });

      if (!response.ok) {
        if (data.requireAuth) {
          // Redirect to login if authentication is required
          router.push(
            `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }
        throw new Error(data.error || "Failed to update privacy settings");
      }

      // Update the local state with the new privacy status
      setIsPrivate(data.private);

      // Show a toast or notification
      toast("Privacy updated");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setPrivacyLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <NotificationModal />
      {/* Add uploader info at the top */}
      {uploaderProfile && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Uploaded by:</span>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={uploaderProfile.avatar_url || undefined}
                alt={getDisplayName()}
              />
              <AvatarFallback>
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{getDisplayName()}</span>
          </div>
        </div>
      )}

      {isPrivate && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
          <LockIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            This image is private and only visible to you
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Human Card - Always on the left */}
        <Card
          className={`relative border-rose-200 overflow-hidden ${
            !isUploader && !voted
              ? "cursor-pointer hover:border-rose-400 transition-colors"
              : ""
          } ${userVote === "human" ? "bg-rose-50" : ""}`}
          onClick={() => !isUploader && !voted && handleVote("human")}
        >
          <CardContent className="pt-6">
            <div className="aspect-square w-full overflow-hidden rounded-lg relative">
              <Image
                src={type === "human" ? animatedUrl : oppositeUrl}
                alt=""
                className={`object-cover w-full h-full transition-opacity duration-300 ${
                  humanImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                onLoad={() => setHumanImageLoaded(true)}
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <span>Human</span>
                <span className="text-xl">👤</span>
                {userVote === "human" && (
                  <span className="text-sm font-medium text-rose-600 ml-2">
                    (I voted)
                  </span>
                )}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Animal Card - Always on the right */}
        <Card
          className={`relative border-rose-200 overflow-hidden ${
            !isUploader && !voted
              ? "cursor-pointer hover:border-rose-400 transition-colors"
              : ""
          } ${userVote === "animal" ? "bg-rose-50" : ""}`}
          onClick={() => !isUploader && !voted && handleVote("animal")}
        >
          <CardContent className="pt-6">
            <div className="aspect-square w-full overflow-hidden rounded-lg relative">
              <Image
                src={
                  regenerating
                    ? ""
                    : type === "human"
                      ? oppositeUrl
                      : animatedUrl
                }
                alt=""
                className={`object-cover w-full h-full transition-opacity duration-300 ${
                  animalImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                onLoad={() => setAnimalImageLoaded(true)}
              />
              {regenerating && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <span>
                  {regenerating
                    ? "Loading..."
                    : type === "human"
                      ? capitalize(targetAnimalType)
                      : capitalize(type)}
                </span>
                <span className="text-xl">🐾</span>
                {userVote === "animal" && (
                  <span className="text-sm font-medium text-rose-600 ml-2">
                    (I voted)
                  </span>
                )}
              </h3>

              {/* Add regeneration controls for uploaders of human images with no votes */}
              {isUploader && type === "human" && !hasVotes && (
                <div className="mt-3 flex items-center gap-2">
                  <Select
                    value={selectedAnimal || ""}
                    onValueChange={setSelectedAnimal}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Regenerate as ..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[...ANIMAL_TYPES].sort().map((animalType) => (
                        <SelectItem key={animalType} value={animalType}>
                          {capitalize(animalType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => handleRegenerate(selectedAnimal || "")}
                    disabled={!selectedAnimal || regenerating}
                    className="bg-rose-500 hover:bg-rose-600 flex-shrink-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Voting section - only visible to non-uploaders who haven't voted yet */}
      {!isUploader && !voted && (
        <Card className="border-rose-200 relative">
          {/* Decorative paw prints */}
          <div className="absolute -left-6 -top-6 opacity-30">
            <PawPrint size="md" color="text-rose-300" rotation={-15} />
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-30">
            <PawPrint size="md" color="text-rose-300" rotation={45} />
          </div>

          {/* Tiny cat peeking from corner */}
          <div className="absolute -right-3 -top-3 z-10 transform rotate-12">
            <RandomCat size="tiny" index={1} />
          </div>

          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center">
              <span>Which one do you think is the original?</span>
              <span className="ml-2 text-xl">🤔</span>
            </h3>
            <div className="flex justify-center gap-4">
              <CatButton
                onClick={() => handleVote("human")}
                disabled={loading}
                variant="outline"
                className="flex-1 max-w-[150px] border-rose-300 text-rose-600 hover:bg-rose-50"
              >
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Human 👤
                </span>
              </CatButton>
              <CatButton
                onClick={() => handleVote("animal")}
                disabled={loading}
                variant="outline"
                className="flex-1 max-w-[150px] border-rose-300 text-rose-600 hover:bg-rose-50"
              >
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Animal 🐾
                </span>
              </CatButton>
            </div>
          </CardContent>
        </Card>
      )}

      {isUploader && (
        /* For uploaders who can't vote, show a share card */
        <Card className="border-rose-200 relative">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3
                className={`text-lg font-semibold flex items-center justify-center gap-2 ${
                  isPrivate ? "line-through text-gray-400" : ""
                }`}
              >
                <span>Share with Friends</span>
                <span className="text-xl">🔗</span>
              </h3>

              <p className={`text-gray-600 ${isPrivate ? "line-through" : ""}`}>
                This is your upload! Share this link with friends so they can
                vote on which image they think is the original.
              </p>

              {isPrivate && (
                <p className="text-amber-600 text-sm font-medium flex items-center justify-center gap-2">
                  <LockIcon className="h-4 w-4" />
                  Make this image public to enable sharing
                </p>
              )}

              <div className="flex items-center gap-2 mt-4">
                <input
                  ref={shareUrlRef}
                  type="text"
                  value={shareUrl}
                  readOnly
                  disabled={isPrivate}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm ${
                    isPrivate
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={(e) => !isPrivate && e.currentTarget.select()}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyShareLink}
                        disabled={isPrivate}
                        className={`border-rose-200 ${
                          isPrivate
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-rose-50"
                        }`}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isPrivate
                          ? "Sharing disabled"
                          : copied
                            ? "Copied!"
                            : "Copy link"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
                <Link href="/">
                  <CatButton className="bg-rose-500 hover:bg-rose-600">
                    <span className="flex items-center gap-2">
                      Upload Another
                      <span className="text-sm">🐾</span>
                    </span>
                  </CatButton>
                </Link>
                <Link href="/gallery">
                  <Button variant="outline" className="gap-2 border-rose-200">
                    <ImageIcon className="h-4 w-4" />
                    View Gallery
                  </Button>
                </Link>

                {isUploader && (
                  <Button
                    variant="outline"
                    className="border-red-200 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                    onClick={handleTogglePrivacy}
                    disabled={loading || privacyLoading}
                  >
                    <label
                      htmlFor="private"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {privacyLoading
                        ? "Loading..."
                        : isPrivate
                          ? "Make Public 📢"
                          : "Make Private 🔐"}
                    </label>
                  </Button>
                )}

                {isUploader && (
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                    onClick={handleDeleteImage}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Image
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(isUploader || voted) && (
        <Card className="border-rose-200 relative">
          {/* Decorative paw prints */}
          <div className="absolute -left-6 -top-6 opacity-30">
            <PawPrint size="md" color="text-rose-300" rotation={-15} />
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-30">
            <PawPrint size="md" color="text-rose-300" rotation={45} />
          </div>

          {/* Celebration cats */}
          {showCelebration && (
            <>
              <div className="absolute left-1/4 -top-8 z-10 animate-bounce">
                <RandomCat size="small" index={0} />
              </div>
              <div
                className="absolute right-1/4 -top-8 z-10 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              >
                <RandomCat size="small" index={1} />
              </div>
              <div
                className="absolute left-1/2 -top-8 z-10 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              >
                <RandomCat size="small" index={2} />
              </div>
            </>
          )}

          <CardContent className="pt-6">
            <div className="flex flex-col items-center mb-4">
              <h3 className="text-lg font-semibold text-center flex items-center justify-center">
                <span>Vote Results</span>
                <span className="ml-2 text-xl">📊</span>
              </h3>

              {/* Add uploader info here */}
              {uploaderProfile && !isUploader && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>Uploaded by:</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={uploaderProfile.avatar_url || undefined}
                        alt={getDisplayName()}
                      />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{getDisplayName()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      Human <span className="text-sm">👤</span>
                    </span>
                    {userVote === "human" && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
                        Your Vote
                      </span>
                    )}
                  </span>
                  <span>
                    {voteStats?.humanVotes || 0}{" "}
                    {voteStats?.humanVotes === 1 ? "vote" : "votes"} (
                    {voteStats?.humanPercentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={voteStats?.humanPercentage || 0}
                  className="h-2 bg-rose-100"
                  indicatorClassName="bg-rose-500"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      Animal <span className="text-sm">🐾</span>
                    </span>
                    {userVote === "animal" && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
                        Your Vote
                      </span>
                    )}
                  </span>
                  <span>
                    {voteStats?.animalVotes || 0}{" "}
                    {voteStats?.animalVotes === 1 ? "vote" : "votes"} (
                    {voteStats?.animalPercentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={voteStats?.animalPercentage || 0}
                  className="h-2 bg-rose-100"
                  indicatorClassName="bg-rose-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-md font-medium text-center  flex items-center justify-center gap-2">
                <span>The original was detected as a {type}</span>
                <span className="text-xl">
                  {type !== "human" ? "🐾" : "👤"}
                </span>
              </h4>
              {/* Original image section - always visible to uploaders, visible to others after voting */}
              {(isUploader || voted) && (
                <CardContent className="pt-2">
                  <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg relative">
                    <Image
                      src={originalUrl}
                      alt="Original"
                      className={`object-cover w-full h-full transition-opacity duration-500 ${
                        originalImageLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onLoad={() => setOriginalImageLoaded(true)}
                    />
                    {/* Add a tiny cat in the corner of the original image */}
                    <div className="absolute right-2 bottom-2 z-10">
                      <RandomCat size="tiny" index={2} />
                    </div>
                  </div>
                </CardContent>
              )}
            </div>

            <div className="mt-6 text-center flex justify-center gap-4">
              <CatButton
                onClick={() => router.push("/")}
                className="bg-rose-500 hover:bg-rose-600"
              >
                <span className="flex items-center gap-2">
                  Try Another Image
                  <span className="text-sm">🐾</span>
                </span>
              </CatButton>

              <Link href="/gallery">
                <Button variant="outline" className="gap-2 border-rose-200">
                  <ImageIcon className="h-4 w-4" />
                  View Gallery
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
