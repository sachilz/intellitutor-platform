import streamlit as st
import streamlit.components.v1 as components
import requests
import json

# Page configuration
st.set_page_config(
    page_title="IntelliLearn - Microservices Swagger UI",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
    <style>
        .main-title {
            font-size: 2.2rem;
            font-weight: 700;
            color: #1E293B;
            margin-bottom: 0.2rem;
        }
        .sub-title {
            font-size: 1rem;
            color: #64748B;
            margin-bottom: 1.5rem;
        }
        .service-badge {
            background-color: #E2E8F0;
            color: #334155;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px;
        }
        .stTabs [data-baseweb="tab"] {
            padding: 8px 16px;
            border-radius: 6px;
        }
    </style>
""", unsafe_allow_html=True)

# Define Microservice Swagger Endpoints
SERVICES = {
    "🌐 Aggregated Gateway Swagger UI": {
        "gateway_url": "http://localhost:8080/swagger-ui.html",
        "direct_url": "http://localhost:8080/swagger-ui.html",
        "openapi_url": "http://localhost:8080/v3/api-docs",
        "description": "Unified Gateway Swagger UI containing specs for all 5 microservices in a single dropdown."
    },
    "👤 User Service": {
        "gateway_url": "http://localhost:8080/user-service/swagger-ui/index.html",
        "direct_url": "http://localhost:8081/swagger-ui.html",
        "openapi_url": "http://localhost:8080/user-service/v3/api-docs",
        "description": "User authentication, profile management, and role-based permissions."
    },
    "📚 Course Service": {
        "gateway_url": "http://localhost:8080/course-service/swagger-ui/index.html",
        "direct_url": "http://localhost:8082/swagger-ui.html",
        "openapi_url": "http://localhost:8080/course-service/v3/api-docs",
        "description": "Course catalog management, module creation, and student enrollment."
    },
    "🧩 Quiz Service": {
        "gateway_url": "http://localhost:8080/quiz-service/swagger-ui/index.html",
        "direct_url": "http://localhost:8083/swagger-ui.html",
        "openapi_url": "http://localhost:8080/quiz-service/v3/api-docs",
        "description": "Quiz generation, automated evaluation, submission tracking, and assessments."
    },
    "📊 Progress Service": {
        "gateway_url": "http://localhost:8080/progress-service/swagger-ui/index.html",
        "direct_url": "http://localhost:8084/swagger-ui.html",
        "openapi_url": "http://localhost:8080/progress-service/v3/api-docs",
        "description": "Student learning analytics, progress tracking, and performance metrics."
    },
    "🤖 AI Tutor Service": {
        "gateway_url": "http://localhost:8080/tutor-service/swagger-ui/index.html",
        "direct_url": "http://localhost:8085/swagger-ui.html",
        "openapi_url": "http://localhost:8080/tutor-service/v3/api-docs",
        "description": "RAG-powered AI tutoring assistant, content summarization, and query execution."
    }
}

# Sidebar Navigation & Settings
st.sidebar.image("https://img.icons8.com/color/96/api-settings.png", width=64)
st.sidebar.title("IntelliLearn Platform")
st.sidebar.caption("Microservice OpenAPI & Swagger Hub")

selected_service_name = st.sidebar.selectbox(
    "Select Microservice Documentation:",
    options=list(SERVICES.keys()),
    index=0
)

access_mode = st.sidebar.radio(
    "Endpoint Routing Mode:",
    options=["API Gateway (Port 8080)", "Direct Service Port"],
    help="API Gateway routes requests via Port 8080. Direct Service uses ports 8081-8085."
)

iframe_height = st.sidebar.slider("Swagger UI Display Height (px)", min_value=500, max_value=1200, value=850, step=50)

# Selected service details
service_info = SERVICES[selected_service_name]
current_url = service_info["gateway_url"] if "Gateway" in access_mode else service_info["direct_url"]

# Main Header
st.markdown(f'<div class="main-title">{selected_service_name}</div>', unsafe_allow_html=True)
st.markdown(f'<div class="sub-title">{service_info["description"]}</div>', unsafe_allow_html=True)

# Quick Action Toolbar
col1, col2, col3 = st.columns([2, 2, 4])

with col1:
    st.link_button("🔗 Open Swagger UI in New Tab", current_url, use_container_width=True)

with col2:
    st.link_button("📄 View Raw OpenAPI Spec (JSON)", service_info["openapi_url"], use_container_width=True)

with col3:
    st.info(f"📍 Active Endpoint: `{current_url}`")

# Tabs View
tab1, tab2, tab3 = st.tabs(["🖥️ Interactive Swagger UI", "🔍 All Services Grid", "📋 Raw OpenAPI JSON Viewer"])

with tab1:
    st.markdown("##### Embedded Interactive Documentation")
    st.caption("Perform interactive API requests directly within Streamlit below:")
    
    # Embedded iFrame
    try:
        components.iframe(current_url, height=iframe_height, scrolling=True)
    except Exception as e:
        st.error(f"Failed to render Swagger UI iframe: {e}")

with tab2:
    st.markdown("##### Quick Access Matrix for All Microservices")
    
    cols = st.columns(2)
    for idx, (s_name, s_data) in enumerate(SERVICES.items()):
        with cols[idx % 2]:
            with st.container(border=True):
                st.subheader(s_name)
                st.write(s_data["description"])
                st.markdown(f"**Gateway URL:** `{s_data['gateway_url']}`")
                st.markdown(f"**Direct Port URL:** `{s_data['direct_url']}`")
                
                c_a, c_b = st.columns(2)
                c_a.link_button("Gateway Swagger", s_data["gateway_url"], use_container_width=True)
                c_b.link_button("Direct Swagger", s_data["direct_url"], use_container_width=True)

with tab3:
    st.markdown(f"##### Raw OpenAPI Schema for `{selected_service_name}`")
    fetch_btn = st.button("Fetch OpenAPI Spec JSON", use_container_width=True)
    
    if fetch_btn:
        try:
            with st.spinner("Fetching schema from Gateway..."):
                resp = requests.get(service_info["openapi_url"], timeout=5)
                if resp.status_code == 200:
                    st.json(resp.json())
                else:
                    st.error(f"HTTP {resp.status_code}: Unable to fetch schema from {service_info['openapi_url']}")
        except Exception as ex:
            st.warning(f"Could not connect to {service_info['openapi_url']}. Ensure microservices are running via docker-compose.")
            st.code(f"Error details: {ex}")

# Footer
st.divider()
st.caption("🚀 IntelliLearn Microservices Platform | Streamlit OpenAPI Gateway Integration")
