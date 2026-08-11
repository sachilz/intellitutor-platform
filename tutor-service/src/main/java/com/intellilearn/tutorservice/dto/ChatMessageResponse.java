package com.intellilearn.tutorservice.dto;

import java.util.List;

public class ChatMessageResponse {

    public static class SourceItem {
        private String title;
        private String url;

        public SourceItem() {}

        public SourceItem(String title, String url) {
            this.title = title;
            this.url = url;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }

    public static class TroubleshootingDetail {
        private String likelyCause;
        private List<String> recommendedChecks;
        private List<String> suggestedCommands;

        public TroubleshootingDetail() {}

        public TroubleshootingDetail(String likelyCause, List<String> recommendedChecks, List<String> suggestedCommands) {
            this.likelyCause = likelyCause;
            this.recommendedChecks = recommendedChecks;
            this.suggestedCommands = suggestedCommands;
        }

        public String getLikelyCause() { return likelyCause; }
        public void setLikelyCause(String likelyCause) { this.likelyCause = likelyCause; }
        public List<String> getRecommendedChecks() { return recommendedChecks; }
        public void setRecommendedChecks(List<String> recommendedChecks) { this.recommendedChecks = recommendedChecks; }
        public List<String> getSuggestedCommands() { return suggestedCommands; }
        public void setSuggestedCommands(List<String> suggestedCommands) { this.suggestedCommands = suggestedCommands; }
    }

    private String sessionId;
    private String answer;
    private String category; // PROJECT_SPECIFIC, GENERAL_KNOWLEDGE, CURRENT_WEB_INFORMATION, PROJECT_TROUBLESHOOTING, MIXED
    private String sourceType; // PROJECT, WEB, GENERAL, TROUBLESHOOTING, MIXED
    private boolean webSearchUsed;
    private List<SourceItem> sources;
    private TroubleshootingDetail troubleshooting;
    private String providerUsed;

    public ChatMessageResponse() {}

    public ChatMessageResponse(String sessionId, String answer, String category, String sourceType, 
                              boolean webSearchUsed, List<SourceItem> sources, 
                              TroubleshootingDetail troubleshooting, String providerUsed) {
        this.sessionId = sessionId;
        this.answer = answer;
        this.category = category;
        this.sourceType = sourceType;
        this.webSearchUsed = webSearchUsed;
        this.sources = sources;
        this.troubleshooting = troubleshooting;
        this.providerUsed = providerUsed;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public boolean isWebSearchUsed() { return webSearchUsed; }
    public void setWebSearchUsed(boolean webSearchUsed) { this.webSearchUsed = webSearchUsed; }
    public List<SourceItem> getSources() { return sources; }
    public void setSources(List<SourceItem> sources) { this.sources = sources; }
    public TroubleshootingDetail getTroubleshooting() { return troubleshooting; }
    public void setTroubleshooting(TroubleshootingDetail troubleshooting) { this.troubleshooting = troubleshooting; }
    public String getProviderUsed() { return providerUsed; }
    public void setProviderUsed(String providerUsed) { this.providerUsed = providerUsed; }
}
