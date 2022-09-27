import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  ActionGroup,
  AlertVariant,
  Button,
  ButtonVariant,
  FormGroup,
  NumberInput,
  PageSection,
  Select,
  SelectOption,
  SelectVariant,
  ValidatedOptions,
} from "@patternfly/react-core";
import { FormAccess } from "../../components/form-access/FormAccess";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { Controller, useForm } from "react-hook-form";
import useToggle from "../../utils/useToggle";
import { useAdminClient } from "../../context/auth/AdminClient";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useAlerts } from "../../components/alert/Alerts";
import { KeycloakTextInput } from "../../components/keycloak-text-input/KeycloakTextInput";

type SmsPolicyProps = {
  realm: RealmRepresentation;
  realmUpdated: (realm: RealmRepresentation) => void;
};

export const SmsPolicy = ({ realm, realmUpdated }: SmsPolicyProps) => {
  const { t } = useTranslation("sms-policy");
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm({ mode: "onChange" });
  const { adminClient } = useAdminClient();
  const { realm: realmName } = useRealm();
  const { addAlert, addError } = useAlerts();
  const [openDefaultGateway, toggleDefaultGateway] = useToggle();
  const [openFallbackGateway, toggleFallbackGateway] = useToggle();
  const [openSenderAddressType, toggleSenderAddressType] = useToggle();
  const [openAuthMethod, toggleAuthMethod] = useToggle();

  const [expanded, setExpanded] = React.useState([""]);
  const [smsatAuthMethod, setSmsAuthMethod] = React.useState("basic");

  const toggleAccordion = (id: any) => {
    const index = expanded.indexOf(id);
    const newExpanded: string[] =
      index < 0
        ? [...expanded, id]
        : [
            ...expanded.slice(0, index),
            ...expanded.slice(index + 1, expanded.length),
          ];
    setExpanded(newExpanded);
  };

  const SMS_GATEWAYS = [
    {
      key: "smsat",
      title: t("smsat.title"),
    },
    {
      key: "nexmo",
      title: t("nexmo.title"),
    },
  ] as const;

  const SENDER_ADDRESS_TYPES = [
    {
      key: "national",
      title: t("smsat.senderAddressType.national"),
    },
    {
      key: "international",
      title: t("smsat.senderAddressType.international"),
    },
    {
      key: "alphanumeric",
      title: t("smsat.senderAddressType.alphanumeric"),
    },
    {
      key: "shortcode",
      title: t("smsat.senderAddressType.shortcode"),
    },
  ] as const;

  const AUTH_METHOD = [
    {
      key: "basic",
      title: t("smsat.authMethod.basic"),
    },
    {
      key: "token",
      title: t("smsat.authMethod.token"),
    },
  ] as const;

  const setupForm = (realm: RealmRepresentation) => {
    reset({
      ...realm,
    });
    setSmsAuthMethod(
      realm.attributes?.["smsatAuthMethod"]
        ? realm.attributes["smsatAuthMethod"]
        : "basic"
    );
  };

  useEffect(() => setupForm(realm), []);

  const prepareRealmAttributes = (inputRealm: RealmRepresentation) => {
    realm.attributes = { ...realm.attributes, ...inputRealm.attributes };
    return realm;
  };

  const save = async (input: RealmRepresentation) => {
    try {
      const merge = prepareRealmAttributes(input);
      await adminClient.realms.update(
        { realm: realmName },
        prepareRealmAttributes(merge)
      );
      const updatedRealm = await adminClient.realms.findOne({
        realm: realmName,
      });
      realmUpdated(updatedRealm!);
      setupForm(updatedRealm!);
      addAlert(t("updateSuccess"), AlertVariant.success);
    } catch (error) {
      addError("updateError", error);
    }
  };

  return (
    <PageSection variant="light">
      <FormAccess
        role="manage-realm"
        isHorizontal
        onSubmit={handleSubmit(save)}
        className="keycloak__sms_policies_authentication__form"
      >
        <FormGroup
          label={t("defaultGateway")}
          labelIcon={
            <HelpItem
              helpText={`sms-policy-help:defaultGateway`}
              fieldLabelId={`sms-policy:defaultGateway`}
            />
          }
          fieldId="attributes.smsDefaultGateway"
        >
          <Controller
            name="attributes.smsDefaultGateway"
            defaultValue={SMS_GATEWAYS[0].key}
            control={control}
            render={({ onChange, value }) => (
              <Select
                toggleId="attributes.smsDefaultGateway"
                onToggle={toggleDefaultGateway}
                onSelect={(_, selectedValue) => {
                  onChange(selectedValue.toString());
                  toggleDefaultGateway();
                }}
                selections={value}
                variant={SelectVariant.single}
                aria-label={t("defaultGateway")}
                typeAheadAriaLabel={t("defaultGateway")}
                isOpen={openDefaultGateway}
              >
                {SMS_GATEWAYS.map((option) => (
                  <SelectOption
                    selected={option.key === value}
                    key={option.key}
                    value={option.key}
                  >
                    {option.title}
                  </SelectOption>
                ))}
              </Select>
            )}
          />
        </FormGroup>
        <FormGroup
          label={t("fallbackGateway")}
          labelIcon={
            <HelpItem
              helpText={`sms-policy-help:fallbackGateway`}
              fieldLabelId={`sms-policy:fallbackGateway`}
            />
          }
          fieldId="attributes.smsFallbackGateway"
        >
          <Controller
            name="attributes.smsFallbackGateway"
            defaultValue={SMS_GATEWAYS[0].key}
            control={control}
            render={({ onChange, value }) => (
              <Select
                toggleId="attributes.smsFallbackGateway"
                onToggle={toggleFallbackGateway}
                onSelect={(_, selectedValue) => {
                  onChange(selectedValue.toString());
                  toggleFallbackGateway();
                }}
                selections={value}
                variant={SelectVariant.single}
                aria-label={t("fallbackGateway")}
                typeAheadAriaLabel={t("fallbackGateway")}
                isOpen={openFallbackGateway}
              >
                {SMS_GATEWAYS.map((option) => (
                  <SelectOption
                    selected={option.key === value}
                    key={option.key}
                    value={option.key}
                  >
                    {option.title}
                  </SelectOption>
                ))}
              </Select>
            )}
          />
        </FormGroup>
        <FormGroup
          label={t("sms-policy:timeout")}
          labelIcon={
            <HelpItem
              helpText="sms-policy-help:timeout"
              fieldLabelId="sms-policy:timeout"
            />
          }
          fieldId="attributes.smsTimeout"
        >
          <Controller
            name="attributes.smsTimeout"
            defaultValue={5}
            control={control}
            rules={{ min: 0, max: 120 }}
            render={({ onChange, value }) => {
              const MIN_VALUE = 0;
              const setValue = (newValue: number) =>
                onChange(Math.max(newValue, MIN_VALUE));

              return (
                <NumberInput
                  id="timeout"
                  value={value}
                  min={MIN_VALUE}
                  onPlus={() => setValue(parseInt(value) + 1)}
                  onMinus={() => setValue(parseInt(value) - 1)}
                  onChange={(event) => {
                    const newValue = Number(event.currentTarget.value);
                    setValue(!isNaN(newValue) ? newValue : 5);
                  }}
                />
              );
            }}
          />
        </FormGroup>
        <FormGroup
          label={t("sms-policy:tanLength")}
          labelIcon={
            <HelpItem
              helpText="sms-policy-help:tanLength"
              fieldLabelId="sms-policy:tanLength"
            />
          }
          fieldId="attributes.smsTanLength"
        >
          <Controller
            name="attributes.smsTanLength"
            defaultValue={6}
            control={control}
            rules={{ min: 1, max: 120 }}
            render={({ onChange, value }) => {
              const MIN_VALUE = 1;
              const setValue = (newValue: number) =>
                onChange(Math.max(newValue, MIN_VALUE));

              return (
                <NumberInput
                  id="tanLength"
                  value={value}
                  min={MIN_VALUE}
                  onPlus={() => setValue(parseInt(value) + 1)}
                  onMinus={() => setValue(parseInt(value) - 1)}
                  onChange={(event) => {
                    const newValue = Number(event.currentTarget.value);
                    setValue(!isNaN(newValue) ? newValue : 6);
                  }}
                />
              );
            }}
          />
        </FormGroup>
        <FormGroup
          label={t("sms-policy:refLength")}
          labelIcon={
            <HelpItem
              helpText="sms-policy-help:refLength"
              fieldLabelId="sms-policy:refLength"
            />
          }
          fieldId="attributes.smsRefLength"
        >
          <Controller
            name="attributes.smsRefLength"
            defaultValue={6}
            control={control}
            rules={{ min: 1, max: 120 }}
            render={({ onChange, value }) => {
              const MIN_VALUE = 1;
              const setValue = (newValue: number) =>
                onChange(Math.max(newValue, MIN_VALUE));

              return (
                <NumberInput
                  id="refLength"
                  value={value}
                  min={MIN_VALUE}
                  onPlus={() => setValue(parseInt(value) + 1)}
                  onMinus={() => setValue(parseInt(value) - 1)}
                  onChange={(event) => {
                    const newValue = Number(event.currentTarget.value);
                    setValue(!isNaN(newValue) ? newValue : 6);
                  }}
                />
              );
            }}
          />
        </FormGroup>
        <FormGroup
          label={t("sms-policy:resendDelay")}
          labelIcon={
            <HelpItem
              helpText="sms-policy-help:resendDelay"
              fieldLabelId="sms-policy:resendDelay"
            />
          }
          fieldId="attributes.smsResendDelay"
        >
          <Controller
            name="attributes.smsResendDelay"
            defaultValue={30}
            control={control}
            rules={{ min: 0, max: 120 }}
            render={({ onChange, value }) => {
              const MIN_VALUE = 0;
              const setValue = (newValue: number) =>
                onChange(Math.max(newValue, MIN_VALUE));

              return (
                <NumberInput
                  id="resendDelay"
                  value={value}
                  min={MIN_VALUE}
                  onPlus={() => setValue(parseInt(value) + 1)}
                  onMinus={() => setValue(parseInt(value) - 1)}
                  onChange={(event) => {
                    const newValue = Number(event.currentTarget.value);
                    setValue(!isNaN(newValue) ? newValue : 30);
                  }}
                />
              );
            }}
          />
        </FormGroup>
        <FormGroup
          label={t("sms-policy:resendMaxRetries")}
          labelIcon={
            <HelpItem
              helpText="sms-policy-help:resendMaxRetries"
              fieldLabelId="sms-policy:resendMaxRetries"
            />
          }
          fieldId="attributes.smsResendMaxRetries"
        >
          <Controller
            name="attributes.smsResendMaxRetries"
            defaultValue={3}
            control={control}
            rules={{ min: 0, max: 120 }}
            render={({ onChange, value }) => {
              const MIN_VALUE = 0;
              const setValue = (newValue: number) =>
                onChange(Math.max(newValue, MIN_VALUE));

              return (
                <NumberInput
                  id="resendMaxRetries"
                  value={value}
                  min={MIN_VALUE}
                  onPlus={() => setValue(parseInt(value) + 1)}
                  onMinus={() => setValue(parseInt(value) - 1)}
                  onChange={(event) => {
                    const newValue = Number(event.currentTarget.value);
                    setValue(!isNaN(newValue) ? newValue : 3);
                  }}
                />
              );
            }}
          />
        </FormGroup>

        <Accordion asDefinitionList={false}>
          <AccordionItem>
            <AccordionToggle
              onClick={() => toggleAccordion("smsat-toggle")}
              isExpanded={expanded.includes("smsat-toggle")}
              id="smsat-toggle"
            >
              {t("smsat.title")}
            </AccordionToggle>
            <AccordionContent
              id="smsat-exp"
              isHidden={!expanded.includes("smsat-toggle")}
            >
              <FormGroup
                labelIcon={
                  <HelpItem
                    helpText="sms-policy-help:smsat.providerUrl"
                    fieldLabelId="sms-policy:smsat.providerUrl"
                  />
                }
                label={t("smsat.providerUrl")}
                fieldId="attributes.smsatProviderUrl"
                validated={ValidatedOptions.default}
              >
                <KeycloakTextInput
                  ref={register()}
                  type="text"
                  id="smsatProviderUrl"
                  name="attributes.smsatProviderUrl"
                  validated={ValidatedOptions.default}
                />
              </FormGroup>
              <FormGroup
                labelIcon={
                  <HelpItem
                    helpText="sms-policy-help:smsat.senderAddress"
                    fieldLabelId="sms-policy:smsat.senderAddress"
                  />
                }
                label={t("smsat.senderAddress")}
                fieldId="attributes.smsatSenderAddress"
                validated={ValidatedOptions.default}
              >
                <KeycloakTextInput
                  ref={register()}
                  type="text"
                  id="smsatSenderAddress"
                  name="attributes.smsatSenderAddress"
                  validated={ValidatedOptions.default}
                />
              </FormGroup>
              <FormGroup
                label={t("smsat.senderAddressType.title")}
                labelIcon={
                  <HelpItem
                    helpText={`sms-policy-help:smsat.senderAddressType`}
                    fieldLabelId={`sms-policy:smsat.senderAddressType.title`}
                  />
                }
                fieldId="attributes.smsatSenderAddressType"
              >
                <Controller
                  name="attributes.smsatSenderAddressType"
                  defaultValue={SENDER_ADDRESS_TYPES[0].key}
                  control={control}
                  render={({ onChange, value }) => (
                    <Select
                      toggleId="attributes.smsatSenderAddressType"
                      onToggle={toggleSenderAddressType}
                      onSelect={(_, selectedValue) => {
                        onChange(selectedValue.toString());
                        toggleSenderAddressType();
                      }}
                      selections={value}
                      variant={SelectVariant.single}
                      aria-label={t("smsat.senderAddressType.title")}
                      typeAheadAriaLabel={t("smsat.senderAddressType.title")}
                      isOpen={openSenderAddressType}
                    >
                      {SENDER_ADDRESS_TYPES.map((option) => (
                        <SelectOption
                          selected={option.key === value}
                          key={option.key}
                          value={option.key}
                        >
                          {option.title}
                        </SelectOption>
                      ))}
                    </Select>
                  )}
                />
              </FormGroup>
              <FormGroup
                label={t("smsat.authMethod.title")}
                labelIcon={
                  <HelpItem
                    helpText={`sms-policy-help:smsat.authMethod`}
                    fieldLabelId={`sms-policy:smsat.authMethod.title`}
                  />
                }
                fieldId="attributes.smsatAuthMethod"
              >
                <Controller
                  name="attributes.smsatAuthMethod"
                  defaultValue={AUTH_METHOD[0].key}
                  control={control}
                  render={({ onChange, value }) => (
                    <Select
                      toggleId="attributes.smsatAuthMethod"
                      onToggle={toggleAuthMethod}
                      onSelect={(_, selectedValue) => {
                        onChange(selectedValue.toString());
                        toggleAuthMethod();
                        setSmsAuthMethod(selectedValue.toString());
                      }}
                      selections={value}
                      variant={SelectVariant.single}
                      aria-label={t("smsat.authMethod.title")}
                      typeAheadAriaLabel={t("smsat.authMethod.title")}
                      isOpen={openAuthMethod}
                    >
                      {AUTH_METHOD.map((option) => (
                        <SelectOption
                          selected={option.key === value}
                          key={option.key}
                          value={option.key}
                        >
                          {option.title}
                        </SelectOption>
                      ))}
                    </Select>
                  )}
                />
              </FormGroup>
              <div hidden={smsatAuthMethod !== "token"}>
                <FormGroup
                  labelIcon={
                    <HelpItem
                      helpText="sms-policy-help:smsat.apiToken"
                      fieldLabelId="sms-policy:smsat.apiToken"
                    />
                  }
                  label={t("smsat.apiToken")}
                  fieldId="attributes.smsatApiToken"
                  validated={ValidatedOptions.default}
                >
                  <KeycloakTextInput
                    ref={register()}
                    type="password"
                    id="smsatApiToken"
                    name="attributes.smsatApiToken"
                    validated={ValidatedOptions.default}
                  />
                </FormGroup>
              </div>
              <div hidden={smsatAuthMethod !== "basic"}>
                <FormGroup
                  labelIcon={
                    <HelpItem
                      helpText="sms-policy-help:smsat.username"
                      fieldLabelId="sms-policy:smsat.username"
                    />
                  }
                  label={t("smsat.username")}
                  fieldId="attributes.smsatUsername"
                  validated={ValidatedOptions.default}
                >
                  <KeycloakTextInput
                    ref={register()}
                    type="text"
                    id="username"
                    name="attributes.smsatUsername"
                    validated={ValidatedOptions.default}
                  />
                </FormGroup>
                <FormGroup
                  labelIcon={
                    <HelpItem
                      helpText="sms-policy-help:smsat.password"
                      fieldLabelId="sms-policy:smsat.password"
                    />
                  }
                  label={t("smsat.password")}
                  fieldId="attributes.smsatPassword"
                  validated={ValidatedOptions.default}
                >
                  <KeycloakTextInput
                    ref={register()}
                    type="password"
                    id="smsatPassword"
                    name="attributes.smsatPassword"
                    validated={ValidatedOptions.default}
                  />
                </FormGroup>
              </div>
              <FormGroup
                label={t("sms-policy:smsat.connectTimeout")}
                labelIcon={
                  <HelpItem
                    helpText="sms-policy-help:smsat.connectTimeout"
                    fieldLabelId="sms-policy:smsat.connectTimeout"
                  />
                }
                fieldId="attributes.smsatConnectTimeout"
              >
                <Controller
                  name="attributes.smsatConnectTimeout"
                  defaultValue={0}
                  control={control}
                  rules={{ min: 0, max: 120 }}
                  render={({ onChange, value }) => {
                    const MIN_VALUE = 0;
                    const setValue = (newValue: number) =>
                      onChange(Math.max(newValue, MIN_VALUE));

                    return (
                      <NumberInput
                        id="smsatConnectTimeout"
                        value={value}
                        min={MIN_VALUE}
                        onPlus={() => setValue(parseInt(value) + 1)}
                        onMinus={() => setValue(parseInt(value) - 1)}
                        onChange={(event) => {
                          const newValue = Number(event.currentTarget.value);
                          setValue(!isNaN(newValue) ? newValue : 0);
                        }}
                      />
                    );
                  }}
                />
              </FormGroup>
              <FormGroup
                label={t("sms-policy:smsat.readTimeout")}
                labelIcon={
                  <HelpItem
                    helpText="sms-policy-help:smsat.readTimeout"
                    fieldLabelId="sms-policy:smsat.readTimeout"
                  />
                }
                fieldId="attributes.smsatReadTimeout"
              >
                <Controller
                  name="attributes.smsatReadTimeout"
                  defaultValue={0}
                  control={control}
                  rules={{ min: 0, max: 120 }}
                  render={({ onChange, value }) => {
                    const MIN_VALUE = 0;
                    const setValue = (newValue: number) =>
                      onChange(Math.max(newValue, MIN_VALUE));

                    return (
                      <NumberInput
                        id="smsatReadTimeout"
                        value={value}
                        min={MIN_VALUE}
                        onPlus={() => setValue(parseInt(value) + 1)}
                        onMinus={() => setValue(parseInt(value) - 1)}
                        onChange={(event) => {
                          const newValue = Number(event.currentTarget.value);
                          setValue(!isNaN(newValue) ? newValue : 0);
                        }}
                      />
                    );
                  }}
                />
              </FormGroup>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem>
            <AccordionToggle
              onClick={() => toggleAccordion("nexmo-toggle")}
              isExpanded={expanded.includes("nexmo-toggle")}
              id="nexmo-toggle"
            >
              {t("nexmo.title")}
            </AccordionToggle>
            <AccordionContent
              id="nexmo-exp"
              isHidden={!expanded.includes("nexmo-toggle")}
            >
              <FormGroup
                labelIcon={
                  <HelpItem
                    helpText="sms-policy-help:nexmo.providerUrl"
                    fieldLabelId="sms-policy:nexmo.providerUrl"
                  />
                }
                label={t("nexmo.providerUrl")}
                fieldId="attributes.nexmoProviderUrl"
                validated={ValidatedOptions.default}
              >
                <KeycloakTextInput
                  ref={register()}
                  type="text"
                  id="nexmoProviderUrl"
                  name="attributes.nexmoProviderUrl"
                  validated={ValidatedOptions.default}
                />
              </FormGroup>
              <FormGroup
                labelIcon={
                  <HelpItem
                    helpText="sms-policy-help:nexmo.senderId"
                    fieldLabelId="sms-policy:nexmo.senderId"
                  />
                }
                label={t("nexmo.senderId")}
                fieldId="attributes.nexmoSenderId"
                validated={ValidatedOptions.default}
              >
                <KeycloakTextInput
                  ref={register()}
                  type="text"
                  id="nexmoSenderId"
                  name="attributes.nexmoSenderId"
                  validated={ValidatedOptions.default}
                />
              </FormGroup>
              <FormGroup
                labelIcon={
                  <HelpItem
                    helpText="sms-policy-help:nexmo.apiKey"
                    fieldLabelId="sms-policy:nexmo.apiKey"
                  />
                }
                label={t("nexmo.apiKey")}
                fieldId="attributes.nexmoApiKey"
                validated={ValidatedOptions.default}
              >
                <KeycloakTextInput
                  ref={register()}
                  type="password"
                  id="nexmoApiKey"
                  name="attributes.nexmoApiKey"
                  validated={ValidatedOptions.default}
                />
              </FormGroup>
              <FormGroup
                labelIcon={
                  <HelpItem
                    helpText="sms-policy-help:nexmo.apiSecret"
                    fieldLabelId="sms-policy:nexmo.apiSecret"
                  />
                }
                label={t("nexmo.apiSecret")}
                fieldId="attributes.nexmoApiSecret"
                validated={ValidatedOptions.default}
              >
                <KeycloakTextInput
                  ref={register()}
                  type="password"
                  id="nexmoApiSecret"
                  name="attributes.nexmoApiSecret"
                  validated={ValidatedOptions.default}
                />
              </FormGroup>
              <FormGroup
                label={t("sms-policy:nexmo.connectTimeout")}
                labelIcon={
                  <HelpItem
                    helpText="sms-policy-help:nexmo.connectTimeout"
                    fieldLabelId="sms-policy:nexmo.connectTimeout"
                  />
                }
                fieldId="attributes.nexmoConnectTimeout"
              >
                <Controller
                  name="attributes.nexmoConnectTimeout"
                  defaultValue={0}
                  control={control}
                  rules={{ min: 0, max: 120 }}
                  render={({ onChange, value }) => {
                    const MIN_VALUE = 0;
                    const setValue = (newValue: number) =>
                      onChange(Math.max(newValue, MIN_VALUE));

                    return (
                      <NumberInput
                        id="nexmoConnectTimeout"
                        value={value}
                        min={MIN_VALUE}
                        onPlus={() => setValue(parseInt(value) + 1)}
                        onMinus={() => setValue(parseInt(value) - 1)}
                        onChange={(event) => {
                          const newValue = Number(event.currentTarget.value);
                          setValue(!isNaN(newValue) ? newValue : 0);
                        }}
                      />
                    );
                  }}
                />
              </FormGroup>
              <FormGroup
                label={t("sms-policy:nexmo.readTimeout")}
                labelIcon={
                  <HelpItem
                    helpText="sms-policy-help:nexmo.readTimeout"
                    fieldLabelId="sms-policy:nexmo.readTimeout"
                  />
                }
                fieldId="attributes.nexmoReadTimeout"
              >
                <Controller
                  name="attributes.nexmoReadTimeout"
                  defaultValue={0}
                  control={control}
                  rules={{ min: 0, max: 120 }}
                  render={({ onChange, value }) => {
                    const MIN_VALUE = 0;
                    const setValue = (newValue: number) =>
                      onChange(Math.max(newValue, MIN_VALUE));

                    return (
                      <NumberInput
                        id="nexmoReadTimeout"
                        value={value}
                        min={MIN_VALUE}
                        onPlus={() => setValue(parseInt(value) + 1)}
                        onMinus={() => setValue(parseInt(value) - 1)}
                        onChange={(event) => {
                          const newValue = Number(event.currentTarget.value);
                          setValue(!isNaN(newValue) ? newValue : 0);
                        }}
                      />
                    );
                  }}
                />
              </FormGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <ActionGroup>
          <Button
            data-testid="save"
            variant="primary"
            type="submit"
            isDisabled={!isDirty}
          >
            {t("common:save")}
          </Button>
          <Button
            data-testid="reload"
            variant={ButtonVariant.link}
            onClick={() => setupForm(realm)}
          >
            {t("common:reload")}
          </Button>
        </ActionGroup>
      </FormAccess>
    </PageSection>
  );
};
