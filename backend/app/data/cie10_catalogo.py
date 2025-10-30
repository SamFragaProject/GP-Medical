"""
Catálogo de Códigos CIE-10 comunes en Medicina del Trabajo
Clasificación Internacional de Enfermedades - 10ª Revisión
"""

# Catálogo de códigos CIE-10 más comunes en Medicina del Trabajo
# Organizados por categorías

CIE10_CATALOGO = [
    # ============================================================================
    # ENFERMEDADES INFECCIOSAS
    # ============================================================================
    {
        "codigo": "J00",
        "nombre": "Rinofaringitis aguda [resfriado común]",
        "categoria": "Enfermedades respiratorias",
        "frecuente": True
    },
    {
        "codigo": "J02.9",
        "nombre": "Faringitis aguda, no especificada",
        "categoria": "Enfermedades respiratorias",
        "frecuente": True
    },
    {
        "codigo": "J03.9",
        "nombre": "Amigdalitis aguda, no especificada",
        "categoria": "Enfermedades respiratorias",
        "frecuente": True
    },
    {
        "codigo": "J06.9",
        "nombre": "Infección aguda de las vías respiratorias superiores, no especificada",
        "categoria": "Enfermedades respiratorias",
        "frecuente": True
    },
    {
        "codigo": "A09",
        "nombre": "Diarrea y gastroenteritis de presunto origen infeccioso",
        "categoria": "Enfermedades infecciosas",
        "frecuente": True
    },

    # ============================================================================
    # ENFERMEDADES DEL SISTEMA RESPIRATORIO
    # ============================================================================
    {
        "codigo": "J18.9",
        "nombre": "Neumonía, no especificada",
        "categoria": "Enfermedades respiratorias",
        "frecuente": False
    },
    {
        "codigo": "J20.9",
        "nombre": "Bronquitis aguda, no especificada",
        "categoria": "Enfermedades respiratorias",
        "frecuente": True
    },
    {
        "codigo": "J40",
        "nombre": "Bronquitis, no especificada como aguda o crónica",
        "categoria": "Enfermedades respiratorias",
        "frecuente": True
    },
    {
        "codigo": "J45.9",
        "nombre": "Asma, no especificada",
        "categoria": "Enfermedades respiratorias",
        "frecuente": False
    },

    # ============================================================================
    # ENFERMEDADES MÚSCULO-ESQUELÉTICAS (muy común en trabajo)
    # ============================================================================
    {
        "codigo": "M54.5",
        "nombre": "Dolor en parte baja de la espalda [lumbalgia]",
        "categoria": "Enfermedades osteomusculares",
        "frecuente": True
    },
    {
        "codigo": "M54.2",
        "nombre": "Cervicalgia",
        "categoria": "Enfermedades osteomusculares",
        "frecuente": True
    },
    {
        "codigo": "M79.1",
        "nombre": "Mialgia",
        "categoria": "Enfermedades osteomusculares",
        "frecuente": True
    },
    {
        "codigo": "M25.5",
        "nombre": "Dolor articular",
        "categoria": "Enfermedades osteomusculares",
        "frecuente": True
    },
    {
        "codigo": "M75.1",
        "nombre": "Síndrome del manguito rotador",
        "categoria": "Enfermedades osteomusculares",
        "frecuente": False
    },
    {
        "codigo": "M77.1",
        "nombre": "Epicondilitis lateral [codo de tenista]",
        "categoria": "Enfermedades osteomusculares",
        "frecuente": False
    },

    # ============================================================================
    # TRAUMATISMOS (común en trabajos industriales)
    # ============================================================================
    {
        "codigo": "S60.9",
        "nombre": "Traumatismo superficial de la muñeca y de la mano, parte no especificada",
        "categoria": "Traumatismos",
        "frecuente": True
    },
    {
        "codigo": "S61.9",
        "nombre": "Herida de la muñeca y de la mano, parte no especificada",
        "categoria": "Traumatismos",
        "frecuente": True
    },
    {
        "codigo": "S93.4",
        "nombre": "Esguince y torcedura del tobillo",
        "categoria": "Traumatismos",
        "frecuente": True
    },
    {
        "codigo": "S83.5",
        "nombre": "Esguince y torcedura de la rodilla",
        "categoria": "Traumatismos",
        "frecuente": False
    },

    # ============================================================================
    # ENFERMEDADES CRÓNICAS
    # ============================================================================
    {
        "codigo": "E11.9",
        "nombre": "Diabetes mellitus no insulinodependiente, sin mención de complicación",
        "categoria": "Enfermedades endocrinas",
        "frecuente": False
    },
    {
        "codigo": "I10",
        "nombre": "Hipertensión esencial (primaria)",
        "categoria": "Enfermedades cardiovasculares",
        "frecuente": False
    },
    {
        "codigo": "E78.5",
        "nombre": "Hiperlipidemia, no especificada",
        "categoria": "Enfermedades endocrinas",
        "frecuente": False
    },
    {
        "codigo": "E66.9",
        "nombre": "Obesidad, no especificada",
        "categoria": "Enfermedades endocrinas",
        "frecuente": False
    },

    # ============================================================================
    # ENFERMEDADES DIGESTIVAS
    # ============================================================================
    {
        "codigo": "K29.7",
        "nombre": "Gastritis, no especificada",
        "categoria": "Enfermedades digestivas",
        "frecuente": True
    },
    {
        "codigo": "K30",
        "nombre": "Dispepsia",
        "categoria": "Enfermedades digestivas",
        "frecuente": True
    },
    {
        "codigo": "K59.0",
        "nombre": "Estreñimiento",
        "categoria": "Enfermedades digestivas",
        "frecuente": True
    },

    # ============================================================================
    # ENFERMEDADES DE LA PIEL
    # ============================================================================
    {
        "codigo": "L20.9",
        "nombre": "Dermatitis atópica, no especificada",
        "categoria": "Enfermedades de la piel",
        "frecuente": False
    },
    {
        "codigo": "L23.9",
        "nombre": "Dermatitis alérgica de contacto, causa no especificada",
        "categoria": "Enfermedades de la piel",
        "frecuente": True
    },
    {
        "codigo": "L30.9",
        "nombre": "Dermatitis, no especificada",
        "categoria": "Enfermedades de la piel",
        "frecuente": True
    },

    # ============================================================================
    # ENFERMEDADES OFTALMOLÓGICAS
    # ============================================================================
    {
        "codigo": "H10.9",
        "nombre": "Conjuntivitis, no especificada",
        "categoria": "Enfermedades del ojo",
        "frecuente": True
    },
    {
        "codigo": "H52.1",
        "nombre": "Miopía",
        "categoria": "Enfermedades del ojo",
        "frecuente": False
    },
    {
        "codigo": "H52.4",
        "nombre": "Presbicia",
        "categoria": "Enfermedades del ojo",
        "frecuente": False
    },

    # ============================================================================
    # ENFERMEDADES DEL OÍDO
    # ============================================================================
    {
        "codigo": "H91.9",
        "nombre": "Pérdida de la audición, no especificada",
        "categoria": "Enfermedades del oído",
        "frecuente": False
    },
    {
        "codigo": "H83.3",
        "nombre": "Efectos del ruido sobre el oído interno",
        "categoria": "Enfermedades del oído",
        "frecuente": True  # Común en industria
    },

    # ============================================================================
    # TRASTORNOS MENTALES Y DEL COMPORTAMIENTO
    # ============================================================================
    {
        "codigo": "F41.9",
        "nombre": "Trastorno de ansiedad, no especificado",
        "categoria": "Trastornos mentales",
        "frecuente": True
    },
    {
        "codigo": "F32.9",
        "nombre": "Episodio depresivo, no especificado",
        "categoria": "Trastornos mentales",
        "frecuente": False
    },
    {
        "codigo": "F43.0",
        "nombre": "Reacción a estrés agudo",
        "categoria": "Trastornos mentales",
        "frecuente": True
    },
    {
        "codigo": "F51.0",
        "nombre": "Insomnio no orgánico",
        "categoria": "Trastornos mentales",
        "frecuente": True
    },

    # ============================================================================
    # CEFALEAS
    # ============================================================================
    {
        "codigo": "R51",
        "nombre": "Cefalea",
        "categoria": "Síntomas generales",
        "frecuente": True
    },
    {
        "codigo": "G43.9",
        "nombre": "Migraña, no especificada",
        "categoria": "Enfermedades neurológicas",
        "frecuente": False
    },

    # ============================================================================
    # OTROS SÍNTOMAS COMUNES
    # ============================================================================
    {
        "codigo": "R50.9",
        "nombre": "Fiebre, no especificada",
        "categoria": "Síntomas generales",
        "frecuente": True
    },
    {
        "codigo": "R53",
        "nombre": "Malestar y fatiga",
        "categoria": "Síntomas generales",
        "frecuente": True
    },
    {
        "codigo": "R06.0",
        "nombre": "Disnea",
        "categoria": "Síntomas respiratorios",
        "frecuente": True
    },
    {
        "codigo": "R05",
        "nombre": "Tos",
        "categoria": "Síntomas respiratorios",
        "frecuente": True
    },
    {
        "codigo": "R10.4",
        "nombre": "Otros dolores abdominales y los no especificados",
        "categoria": "Síntomas digestivos",
        "frecuente": True
    },

    # ============================================================================
    # EXÁMENES Y CONTACTOS CON SERVICIOS DE SALUD (importante en med. trabajo)
    # ============================================================================
    {
        "codigo": "Z00.0",
        "nombre": "Examen médico general",
        "categoria": "Exámenes",
        "frecuente": True
    },
    {
        "codigo": "Z02.1",
        "nombre": "Examen médico previo al ingreso a una institución",
        "categoria": "Exámenes",
        "frecuente": True
    },
    {
        "codigo": "Z02.2",
        "nombre": "Examen médico para el ingreso a instituciones educativas",
        "categoria": "Exámenes",
        "frecuente": False
    },
    {
        "codigo": "Z10",
        "nombre": "Examen general de rutina (chequeo) de subpoblación definida",
        "categoria": "Exámenes",
        "frecuente": True
    },
]


def buscar_cie10(termino: str, limite: int = 20):
    """
    Busca códigos CIE-10 por término
    """
    termino = termino.lower()
    resultados = []

    for codigo in CIE10_CATALOGO:
        # Buscar en código y nombre
        if termino in codigo["codigo"].lower() or termino in codigo["nombre"].lower():
            resultados.append(codigo)

    # Ordenar: primero los frecuentes, luego alfabéticamente
    resultados.sort(key=lambda x: (not x["frecuente"], x["codigo"]))

    return resultados[:limite]


def obtener_por_codigo(codigo: str):
    """
    Obtiene un código CIE-10 específico
    """
    for item in CIE10_CATALOGO:
        if item["codigo"] == codigo:
            return item
    return None


def obtener_frecuentes(limite: int = 10):
    """
    Obtiene los códigos más frecuentes en Medicina del Trabajo
    """
    frecuentes = [c for c in CIE10_CATALOGO if c["frecuente"]]
    return frecuentes[:limite]


def obtener_por_categoria(categoria: str):
    """
    Obtiene códigos por categoría
    """
    return [c for c in CIE10_CATALOGO if c["categoria"] == categoria]


def obtener_categorias():
    """
    Obtiene todas las categorías disponibles
    """
    categorias = set(c["categoria"] for c in CIE10_CATALOGO)
    return sorted(list(categorias))
