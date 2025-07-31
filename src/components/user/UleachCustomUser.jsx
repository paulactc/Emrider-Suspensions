import { NavLink } from "react-router";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Code,
  Building,
  Edit3,
  Bike,
  Plus,
} from "lucide-react";

function UleachCustomUser({ Custom, listBikes }) {
  console.log("Renderizando componente:", Custom?.Cliente);

  if (!Custom) {
    console.warn("UleachCustomUser recibió un 'Custom' indefinido o nulo.");
    return null;
  }

  const safeDisplay = (value) => value || "No disponible";

  // Verificar si el cliente tiene motos
  const motosDelCliente =
    listBikes?.motos?.filter((moto) => moto.clienteId === Custom.id) || [];
  const tieneMotos = motosDelCliente.length > 0;

  const customerData = [
    { icon: Mail, label: "Email", value: Custom.Email },
    { icon: Phone, label: "Teléfono", value: Custom.telefono },
    { icon: MapPin, label: "Dirección", value: Custom.Dirección },
    { icon: Code, label: "Código Postal", value: Custom.CódigoPostal },
    { icon: Building, label: "Población", value: Custom.Población },
    { icon: MapPin, label: "Provincia", value: Custom.Provincia },
  ];

  return (
    <div className="uleach-customer">
      {/* Header con información principal */}
      <div className="uleach-customer__header">
        <div className="uleach-customer__header-content">
          <div className="uleach-customer__header-avatar">
            <User />
          </div>
          <div className="uleach-customer__header-info">
            <h2>{safeDisplay(Custom.Cliente)}</h2>
            <p>Cliente del Taller</p>
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="uleach-customer__info">
        <div className="uleach-customer__info-grid">
          {customerData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="uleach-customer__info-card">
                <div className="uleach-customer__info-card-content">
                  <div className="uleach-customer__info-icon">
                    <IconComponent />
                  </div>
                  <div className="uleach-customer__info-text">
                    <p className="uleach-customer__info-text-label">
                      {item.label}
                    </p>
                    <p className="uleach-customer__info-text-value">
                      {safeDisplay(item.value)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección de motocicletas */}
      <div className="uleach-customer__bikes">
        <h3 className="uleach-customer__bikes-title">
          <Bike />
          Motocicletas
        </h3>

        {Custom.id && (
          <div className="uleach-customer__bikes-actions">
            {tieneMotos ? (
              <NavLink
                to={`/admin/motos/${Custom.id}`} // ✅ Agregar la barra inicial
                state={{ listBikes }}
                className="ohlins-btn ohlins-btn--primary"
              >
                <Bike />
                Ver mis motocicletas ({motosDelCliente.length})
              </NavLink>
            ) : (
              <NavLink
                to="/FormBike"
                state={{ clienteId: Custom.id, clientData: Custom }}
                className="ohlins-btn ohlins-btn--secondary"
              >
                <Plus />
                Registrar mi motocicleta
              </NavLink>
            )}
          </div>
        )}
      </div>

      {/* Footer con botón de editar */}
      <div className="uleach-customer__footer">
        <NavLink
          to={`/editar-cliente/${Custom.id}`}
          className="ohlins-btn ohlins-btn--outline"
        >
          <Edit3 to="/formsCustom" />
          Editar mis datos de cliente
        </NavLink>
      </div>

      {/* Elemento decorativo */}
      <div className="uleach-customer__decorator">
        <div className="uleach-customer__decorator-line"></div>
      </div>
    </div>
  );
}

export default UleachCustomUser;
