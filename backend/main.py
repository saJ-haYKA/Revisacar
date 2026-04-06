from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional
import uuid
import sqlite3
import json
import re
from datetime import datetime
from contextlib import contextmanager

app = FastAPI(
    title="RevisaCar API",
    version="4.0.0",
    description="Sistema profissional de ordens de serviço e inspeção veicular.",
)

# ── CORS ───────────────────────────────────────────────────────────────────────

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)

# ── CONFIG ────────────────────────────────────────────────────────────────────

DB_PATH          = "revisacar.db"
MAX_FOTO_SIZE_BYTES = 5 * 1024 * 1024   # 5 MB
MAX_FOTOS        = 30

# ── DATABASE ──────────────────────────────────────────────────────────────────

def init_db() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ordens (
                id         TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                os_num     TEXT,
                placa      TEXT,
                modelo     TEXT,
                cliente    TEXT,
                status     TEXT DEFAULT 'rascunho',
                payload    TEXT NOT NULL
            )
        """)
        conn.commit()


init_db()


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


# ── MODELS ────────────────────────────────────────────────────────────────────

class OSHeader(BaseModel):
    os_num:  str
    os_date: str
    os_time: str
    os_km:   str = ""

    @field_validator("os_num")
    @classmethod
    def os_num_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("os_num não pode ser vazio")
        return v

    @field_validator("os_date")
    @classmethod
    def valid_date(cls, v: str) -> str:
        if v and not re.match(r"^\d{4}-\d{2}-\d{2}$", v):
            raise ValueError("os_date deve estar no formato AAAA-MM-DD")
        return v

    @field_validator("os_time")
    @classmethod
    def valid_time(cls, v: str) -> str:
        if v and not re.match(r"^\d{2}:\d{2}$", v):
            raise ValueError("os_time deve estar no formato HH:MM")
        return v


class Cliente(BaseModel):
    nome:  str
    doc:   str = ""
    tel:   str
    email: str = ""

    @field_validator("nome", "tel")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Campo obrigatório")
        return v.strip()


class Veiculo(BaseModel):
    placa:              str
    modelo:             str
    ano:                str = ""
    cor:                str = ""
    combustivel:        str = ""
    nivel_combustivel:  str = ""
    chassi:             str = ""
    obs_entrada:        str = ""

    @field_validator("placa", "modelo")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Campo obrigatório")
        return v.strip()

    @field_validator("placa")
    @classmethod
    def valid_placa(cls, v: str) -> str:
        v = v.upper().strip()
        if not re.match(r"^[A-Z]{3}[-]?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$", v):
            raise ValueError("Placa inválida")
        return v


class ChecklistItem(BaseModel):
    status: Optional[str] = None
    obs:    str = ""

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("ok", "warn", "crit", "na"):
            raise ValueError("status inválido")
        return v


class Tecnico(BaseModel):
    nome:          str = ""
    registro:      str = ""
    data_saida:    str = ""
    hora_saida:    str = ""
    km_saida:      str = ""
    parecer_geral: str = ""


class OrdemServico(BaseModel):
    os_header:             OSHeader
    cliente:               Cliente
    veiculo:               Veiculo
    servicos_selecionados: list[str] = []
    checklist:             dict[str, ChecklistItem] = {}
    fotos_base64:          list[str] = []
    tecnico:               Optional[Tecnico] = None
    status:                str = "rascunho"

    @field_validator("fotos_base64")
    @classmethod
    def validate_fotos(cls, v: list[str]) -> list[str]:
        if len(v) > MAX_FOTOS:
            raise ValueError(f"Máximo de {MAX_FOTOS} fotos permitidas")
        for foto in v:
            if not foto.startswith("data:image/"):
                raise ValueError("Foto inválida: deve ser um data URL de imagem")
            if len(foto.encode("utf-8")) > MAX_FOTO_SIZE_BYTES * 1.4:
                raise ValueError("Uma ou mais fotos excedem o tamanho máximo de 5 MB")
        return v

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        if v not in ("rascunho", "concluido", "cancelado"):
            raise ValueError("status inválido")
        return v


# ── HELPERS ───────────────────────────────────────────────────────────────────

def ordem_row_to_dict(row: sqlite3.Row) -> dict:
    d = dict(row)
    if "payload" in d:
        d["data"] = json.loads(d.pop("payload"))
    return d


def validate_uuid(ordem_id: str) -> None:
    try:
        uuid.UUID(ordem_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID inválido")


# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["status"])
def root():
    return {"app": "RevisaCar", "version": "3.0.0", "status": "online"}


@app.get("/health", tags=["status"])
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.post("/ordens", status_code=201, tags=["ordens"])
def criar_ordem(ordem: OrdemServico):
    ordem_id = str(uuid.uuid4())
    now      = datetime.now().isoformat()
    payload  = ordem.model_dump_json()

    with get_db() as conn:
        conn.execute(
            "INSERT INTO ordens VALUES (?,?,?,?,?,?,?,?,?)",
            (
                ordem_id, now, now,
                ordem.os_header.os_num,
                ordem.veiculo.placa,
                ordem.veiculo.modelo,
                ordem.cliente.nome,
                ordem.status,
                payload,
            ),
        )
        conn.commit()

    return {"id": ordem_id, "created_at": now, "updated_at": now, "data": ordem}


@app.get("/ordens", tags=["ordens"])
def listar_ordens(status: Optional[str] = None):
    query = (
        "SELECT id, created_at, updated_at, os_num, placa, modelo, cliente, status"
        " FROM ordens"
    )
    params: tuple = ()

    if status:
        query += " WHERE status = ?"
        params = (status,)

    query += " ORDER BY created_at DESC"

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()

    return [dict(r) for r in rows]


@app.get("/ordens/{ordem_id}", tags=["ordens"])
def obter_ordem(ordem_id: str):
    validate_uuid(ordem_id)
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM ordens WHERE id = ?", (ordem_id,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")

    return ordem_row_to_dict(row)


@app.put("/ordens/{ordem_id}", tags=["ordens"])
def atualizar_ordem(ordem_id: str, ordem: OrdemServico):
    validate_uuid(ordem_id)
    now     = datetime.now().isoformat()
    payload = ordem.model_dump_json()

    with get_db() as conn:
        result = conn.execute(
            """UPDATE ordens
               SET updated_at = ?, os_num = ?, placa = ?, modelo = ?,
                   cliente = ?, status = ?, payload = ?
               WHERE id = ?""",
            (
                now,
                ordem.os_header.os_num,
                ordem.veiculo.placa,
                ordem.veiculo.modelo,
                ordem.cliente.nome,
                ordem.status,
                payload,
                ordem_id,
            ),
        )
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Ordem não encontrada")

    return {"id": ordem_id, "updated_at": now, "data": ordem}


@app.patch("/ordens/{ordem_id}/status", tags=["ordens"])
def atualizar_status(ordem_id: str, status: str):
    validate_uuid(ordem_id)
    if status not in ("rascunho", "concluido", "cancelado"):
        raise HTTPException(status_code=400, detail="Status inválido")

    now = datetime.now().isoformat()
    with get_db() as conn:
        result = conn.execute(
            "UPDATE ordens SET status = ?, updated_at = ? WHERE id = ?",
            (status, now, ordem_id),
        )
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Ordem não encontrada")

    return {"id": ordem_id, "status": status, "updated_at": now}


@app.delete("/ordens/{ordem_id}", tags=["ordens"])
def deletar_ordem(ordem_id: str):
    validate_uuid(ordem_id)
    with get_db() as conn:
        result = conn.execute(
            "DELETE FROM ordens WHERE id = ?", (ordem_id,)
        )
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Ordem não encontrada")

    return {"message": "Ordem deletada com sucesso"}


@app.get("/ordens/{ordem_id}/resumo", tags=["ordens"])
def resumo_ordem(ordem_id: str):
    validate_uuid(ordem_id)
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM ordens WHERE id = ?", (ordem_id,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")

    d       = ordem_row_to_dict(row)
    payload = d.get("data", {})
    checklist = payload.get("checklist", {})

    statuses = [v.get("status") for v in checklist.values() if isinstance(v, dict)]
    resumo = {
        "id":         d["id"],
        "os_num":     d["os_num"],
        "placa":      d["placa"],
        "modelo":     d["modelo"],
        "cliente":    d["cliente"],
        "status":     d["status"],
        "created_at": d["created_at"],
        "updated_at": d["updated_at"],
        "checklist_stats": {
            "total": len(statuses),
            "ok":    statuses.count("ok"),
            "warn":  statuses.count("warn"),
            "crit":  statuses.count("crit"),
            "na":    statuses.count("na"),
        },
        "fotos": len(payload.get("fotos_base64", [])),
    }
    return resumo
