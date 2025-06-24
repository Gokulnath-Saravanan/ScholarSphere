# 🧠 ScholarSphere

**ScholarSphere** is a research networking and collaboration platform that enables users to discover, connect, and collaborate with scholars based on their research interests. It combines intelligent domain classification using a T5 transformer model with a modern web interface to simplify the process of academic collaboration and exploration.

---

## 🚀 Features

- 🔍 **Domain Classification:** Automatically classifies research publications using a T5 transformer-based NLP model.
- 👥 **Scholar Discovery:** Find and connect with researchers who share similar interests.
- 📂 **Research Profiles:** Each user can manage a public-facing profile with their research contributions.
- 🧠 **Intelligent Matching:** Uses NLP and AI to recommend potential collaborators.
- ⚡ **Modern Frontend:** Built with a fast and responsive UI powered by Vite + React + Tailwind CSS.

---

## 🛠️ Tech Stack

### 📌 Backend
- **FastAPI** – High-performance Python web framework for APIs.
- **T5 Transformer** – NLP model for domain classification of research abstracts/papers.

### 💻 Frontend
- **Vite** – Lightning-fast frontend tooling.
- **React** – Component-based UI framework.
- **TypeScript** – Strongly typed superset of JavaScript.
- **Tailwind CSS** – Utility-first CSS framework for rapid styling.
- **shadcn/ui** – Accessible and beautifully designed UI components.

---

## 📦 Installation

### Clone the repository
```bash
git clone https://github.com/yourusername/scholarsphere.git
cd scholarsphere

cd backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload


cd frontend
npm install
npm run dev
