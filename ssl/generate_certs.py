#!/usr/bin/env python3
"""
Genera certificati SSL/TLS self-signed per sviluppo locale Elisee Scout.
Produzione: usare Let's Encrypt / certificato CA (vedi README.md).
"""
from __future__ import annotations

import datetime
import ipaddress
import sys
from pathlib import Path

try:
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.x509.oid import ExtendedKeyUsageOID, NameOID
except ImportError:
    print("Installa la dipendenza: python -m pip install cryptography")
    sys.exit(1)

DIR = Path(__file__).resolve().parent
KEY_PATH = DIR / "key.pem"
CERT_PATH = DIR / "cert.pem"
DAYS = 825  # ~2.25 anni (limite tipico browser)


def main() -> None:
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    subject = issuer = x509.Name(
        [
            x509.NameAttribute(NameOID.COUNTRY_NAME, "IT"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Italia"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Elisee Scout Dev"),
            x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
        ]
    )

    now = datetime.datetime.now(datetime.timezone.utc)
    san = x509.SubjectAlternativeName(
        [
            x509.DNSName("localhost"),
            x509.DNSName("127.0.0.1"),
            x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
            x509.IPAddress(ipaddress.IPv6Address("::1")),
        ]
    )

    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - datetime.timedelta(minutes=1))
        .not_valid_after(now + datetime.timedelta(days=DAYS))
        .add_extension(san, critical=False)
        .add_extension(
            x509.BasicConstraints(ca=False, path_length=None), critical=True
        )
        .add_extension(
            x509.KeyUsage(
                digital_signature=True,
                key_encipherment=True,
                content_commitment=False,
                data_encipherment=False,
                key_agreement=False,
                key_cert_sign=False,
                crl_sign=False,
                encipher_only=False,
                decipher_only=False,
            ),
            critical=True,
        )
        .add_extension(
            x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]),
            critical=False,
        )
        .sign(key, hashes.SHA256())
    )

    KEY_PATH.write_bytes(
        key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        )
    )
    CERT_PATH.write_bytes(cert.public_bytes(serialization.Encoding.PEM))

    print(f"OK  chiave privata : {KEY_PATH}")
    print(f"OK  certificato    : {CERT_PATH}")
    print(f"    validita'      : {DAYS} giorni (self-signed, solo sviluppo)")
    print("    per produzione  : usa Let's Encrypt (vedi ssl/README.md)")


if __name__ == "__main__":
    main()
