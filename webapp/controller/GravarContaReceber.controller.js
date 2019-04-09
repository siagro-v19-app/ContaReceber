sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecContaReceber/helpers/ParceiroNegocioHelpDialog",
	"br/com/idxtecContaReceber/helpers/CentroCustoHelpDialog",
	"br/com/idxtecContaReceber/helpers/ContaContabilHelpDialog",
	"br/com/idxtecContaReceber/helpers/TipoTituloHelpDialog",
	"br/com/idxtecContaReceber/services/Session"
], function(Controller, History, MessageBox, JSONModel, ParceiroNegocioHelpDialog,
	CentroCustoHelpDialog, ContaContabilHelpDialog, TipoTituloHelpDialog, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecContaReceber.controller.GravarContaReceber", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarcontareceber").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		parceiroNegocioReceived: function() {
			this.getView().byId("parceironegocio").setSelectedKey(this.getModel("model").getProperty("/ParceiroNegocio"));
		},
		
		centroCustoReceived: function() {
			this.getView().byId("centrocusto").setSelectedKey(this.getModel("model").getProperty("/CentroCusto"));
		},
		
		contaContabilReceived: function() {
			this.getView().byId("contacontabil").setSelectedKey(this.getModel("model").getProperty("/PlanoConta"));
		},
		
		tipoTituloReceived: function() {
			this.getView().byId("tipotitulo").setSelectedKey(this.getModel("model").getProperty("/TipoTitulo"));
		},
		
		handleSearchParceiro: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			ParceiroNegocioHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchCentroCusto: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			CentroCustoHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchContaContabil: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			ContaContabilHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchTipo: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			TipoTituloHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			this.getView().byId("parceironegocio").setValue(null);
			this.getView().byId("centrocusto").setValue(null);
			this.getView().byId("contacontabil").setValue(null);
			this.getView().byId("tipotitulo").setValue(null);
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Conta a Receber"
				});
			
				var oNovoContaReceber = {
					"Id": 0,
					"Titulo": "",
					"TipoTitulo": "",
					"Valor": 0.00,
					"Acrescimo": 0.00,
					"Desconto": 0.00,
					"Emissao": null,
					"Vencimento": null,
					"Total": 0.00,
					"Saldo": 0.00,
					"ParceiroNegocio": 0,
					"CentroCusto": 0,
					"ContaContabil": "",
					"Historico": "",
					"Empresa" : Session.get("EMPRESA_ID"),
					"Usuario": Session.get("USUARIO_ID"),
					"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
					"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
				};
				
				oJSONModel.setData(oNovoContaReceber);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Conta a Receber"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createConta();
			} else if (this._operacao === "editar") {
				this._updateConta();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
			} else {
				oRouter.navTo("contareceber", {}, true);
			}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.ParceiroNegocio = oDados.ParceiroNegocio ? oDados.ParceiroNegocio : 0;
			oDados.CentroCusto = oDados.CentroCusto ? oDados.CentroCusto : 0;
		
			oDados.TipoTituloDetails = {
				__metadata: {
					uri: "/TipoTitulos('" + oDados.TipoTitulo + "')"
				}
			};
			
			oDados.ParceiroNegocioDetails = {
				__metadata: {
					uri: "/ParceiroNegocios(" + oDados.ParceiroNegocio + ")"
				}
			};
			
			oDados.CentroCustoDetails = {
				__metadata: {
					uri: "/CentroCustos(" + oDados.CentroCusto + ")"
				}
			};
			
			oDados.PlanoContaDetails = {
				__metadata: {
					uri: "/PlanoContas('" + oDados.ContaContabil + "')"
				}
			};

			return oDados;
		},
		
		_createConta: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.create("/ContaRecebers", this._getDados(), {
				success: function() {
					MessageBox.success("Conta a receber inserida com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				}
			});
		},
		
		_updateConta: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Conta a receber inserida com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("titulo").getValue() === "" || oView.byId("tipotitulo").getSelectedItem() === null
			|| oView.byId("valor").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		},
		
		getModel : function(sModel) {
			return this.getOwnerComponent().getModel(sModel);	
		}
	});

});