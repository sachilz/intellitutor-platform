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

# Dynamic Gateway URL resolution (reads from st.secrets, env vars, or defaults to localhost)
import os

def get_base_gateway_url():
    try:
        if hasattr(st, "secrets") and "VITE_GATEWAY_URL" in st.secrets:
            return st.secrets["VITE_GATEWAY_URL"].rstrip("/")
        if hasattr(st, "secrets") and "GATEWAY_URL" in st.secrets:
            return st.secrets["GATEWAY_URL"].rstrip("/")
    except Exception:
        pass
    return os.getenv("GATEWAY_URL", os.getenv("VITE_GATEWAY_URL", "http://localhost:8080")).rstrip("/")

GATEWAY_BASE = get_base_gateway_url()

# Define Microservice Swagger Endpoints
SERVICES = {
    "🌐 Aggregated Gateway Swagger UI": {
        "gateway_url": f"{GATEWAY_BASE}/swagger-ui.html",
        "direct_url": f"{GATEWAY_BASE}/swagger-ui.html",
        "openapi_url": f"{GATEWAY_BASE}/v3/api-docs",
        "description": "Unified Gateway Swagger UI containing specs for all 5 microservices in a single dropdown."
    },
    "👤 User Service": {
        "gateway_url": f"{GATEWAY_BASE}/user-service/swagger-ui/index.html",
        "direct_url": "http://localhost:8081/swagger-ui.html",
        "openapi_url": f"{GATEWAY_BASE}/user-service/v3/api-docs",
        "description": "User authentication, profile management, and role-based permissions."
    },
    "📚 Course Service": {
        "gateway_url": f"{GATEWAY_BASE}/course-service/swagger-ui/index.html",
        "direct_url": "http://localhost:8082/swagger-ui.html",
        "openapi_url": f"{GATEWAY_BASE}/course-service/v3/api-docs",
        "description": "Course catalog management, module creation, and student enrollment."
    },
    "🧩 Quiz Service": {
        "gateway_url": f"{GATEWAY_BASE}/quiz-service/swagger-ui/index.html",
        "direct_url": "http://localhost:8083/swagger-ui.html",
        "openapi_url": f"{GATEWAY_BASE}/quiz-service/v3/api-docs",
        "description": "Quiz generation, automated evaluation, submission tracking, and assessments."
    },
    "📊 Progress Service": {
        "gateway_url": f"{GATEWAY_BASE}/progress-service/swagger-ui/index.html",
        "direct_url": "http://localhost:8084/swagger-ui.html",
        "openapi_url": f"{GATEWAY_BASE}/progress-service/v3/api-docs",
        "description": "Student learning analytics, progress tracking, and performance metrics."
    },
    "🤖 AI Tutor Service": {
        "gateway_url": f"{GATEWAY_BASE}/tutor-service/swagger-ui/index.html",
        "direct_url": "http://localhost:8085/swagger-ui.html",
        "openapi_url": f"{GATEWAY_BASE}/tutor-service/v3/api-docs",
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

# Helper function to generate inline standalone React app HTML
def get_standalone_react_html():
    client_dir = os.path.join(os.path.dirname(__file__), "client")
    dist_dir = os.path.join(client_dir, "dist")
    assets_dir = os.path.join(dist_dir, "assets")
    
    # If dist folder doesn't exist, try building client
    if not os.path.exists(dist_dir) or not os.path.exists(assets_dir):
        import subprocess
        try:
            subprocess.run(["npm", "--prefix", client_dir, "run", "build"], check=True)
        except Exception as err:
            return f"<h3>Error building client: {err}</h3>"
            
    css_content = ""
    js_content = ""
    
    if os.path.exists(assets_dir):
        for f in os.listdir(assets_dir):
            fpath = os.path.join(assets_dir, f)
            if f.endswith(".css"):
                with open(fpath, "r", encoding="utf-8") as file:
                    css_content += file.read() + "\n"
            elif f.endswith(".js"):
                with open(fpath, "r", encoding="utf-8") as file:
                    js_content += file.read() + "\n"
                    
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IntelliLearn - AI Learning Platform</title>
    <style>
      {css_content}
      body {{ margin: 0; padding: 0; background-color: #050811; }}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      {js_content}
    </script>
  </body>
</html>"""

# Tabs View
tab_app, tab1, tab2, tab3 = st.tabs(["🚀 IntelliLearn Web App", "🖥️ Interactive Swagger UI", "🔍 All Services Grid", "📋 Raw OpenAPI JSON Viewer"])

with tab_app:
    st.markdown("##### IntelliLearn Full React Web Application")
    html_bundle = get_standalone_react_html()
    components.html(html_bundle, height=850, scrolling=True)

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

