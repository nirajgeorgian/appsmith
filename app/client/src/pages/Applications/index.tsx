import React, { Component } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { AppState } from "reducers";
import { Card, Icon, Dialog, Classes, Colors } from "@blueprintjs/core";
import Button from "components/editorComponents/Button";
import {
  getApplicationList,
  getIsFetchingApplications,
  getIsCreatingApplication,
  getCreateApplicationError,
  getIsDeletingApplication,
  getUserApplicationsOrgsList,
  getIsDuplicatingApplication,
} from "selectors/applicationSelectors";
import {
  ReduxActionTypes,
  ApplicationPayload,
} from "constants/ReduxActionConstants";
import PageWrapper from "pages/common/PageWrapper";
import SubHeader from "pages/common/SubHeader";
import PageSectionDivider from "pages/common/PageSectionDivider";
import ApplicationCard from "./ApplicationCard";
import CreateApplicationForm from "./CreateApplicationForm";
import OrgInviteUsersForm from "pages/organization/OrgInviteUsersForm";
import { PERMISSION_TYPE, isPermitted } from "./permissionHelpers";
import FormDialogComponent from "components/editorComponents/form/FormDialogComponent";
import { User } from "constants/userConstants";
import CustomizedDropdown, {
  CustomizedDropdownProps,
} from "pages/common/CustomizedDropdown";
import { getCurrentUser } from "selectors/usersSelectors";
import CreateOrganizationForm from "pages/organization/CreateOrganizationForm";
import { CREATE_ORGANIZATION_FORM_NAME } from "constants/forms";
import {
  getOnSelectAction,
  DropdownOnSelectActions,
} from "pages/common/CustomizedDropdown/dropdownHelpers";
import { Directions } from "utils/helpers";
import { HeaderIcons } from "icons/HeaderIcons";
import { duplicateApplication } from "actions/applicationActions";

const OrgDropDown = styled.div`
  display: flex;
  padding: ${props => props.theme.spaces[4]}px
    ${props => props.theme.spaces[4]}px;
  font-size: ${props => props.theme.fontSizes[1]}px;
  justify-content: space-between;
`;

const CreateNew = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-top: 20px;
`;
const ApplicationCardsWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: space-evenly;
  font-size: ${props => props.theme.fontSizes[4]}px;
`;

const OrgSection = styled.div``;

const OrgName = styled.div`
  display: flex;
  font-size: ${props => props.theme.fontSizes[4]}px;
  font-weight: ${props => props.theme.fontWeights[3]};
  padding-top: ${props => props.theme.spaces[4]}px;
  padding-left: ${props => props.theme.spaces[6]}px;
  & > span {
    margin-right: 10px;
  }
`;

const DropDownTrigger = styled.div`
  font-size: ${props => props.theme.fontSizes[4]}px;
  font-weight: ${props => props.theme.fontWeights[3]};
  cursor: pointer;
`;

const PaddingWrapper = styled.div`
  width: ${props => props.theme.card.minWidth + props.theme.spaces[5] * 2}px;
  margin: ${props => props.theme.spaces[5]}px
    ${props => props.theme.spaces[5]}px;
`;

const ApplicationAddCardWrapper = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: ${props => props.theme.card.minWidth}px;
  height: ${props => props.theme.card.minHeight}px;
  position: relative;
  border-radius: ${props => props.theme.radii[1]}px;
  box-shadow: none;
  border: 1px dashed #d0d7dd;
  margin: ${props => props.theme.spaces[11]}px
    ${props => props.theme.spaces[5]}px;
  a {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    height: calc(100% - ${props => props.theme.card.titleHeight}px);
    width: 100%;
  }
  cursor: pointer;
`;

const StyledDialog = styled(Dialog)<{ setMaxWidth?: boolean }>`
  && {
    background: white;
    & .bp3-dialog-header {
      padding: ${props => props.theme.spaces[4]}px
        ${props => props.theme.spaces[4]}px;
    }
    & .bp3-dialog-footer-actions {
      display: block;
    }
    ${props => props.setMaxWidth && `width: 100vh;`}
  }
`;

type ApplicationProps = {
  applicationList: ApplicationPayload[];
  createApplication: (appName: string) => void;
  isCreatingApplication: boolean;
  isFetchingApplications: boolean;
  createApplicationError?: string;
  searchApplications: (keyword: string) => void;
  deleteApplication: (id: string) => void;
  duplicateApplication: (id: string) => void;
  deletingApplication: boolean;
  duplicatingApplication: boolean;
  getAllApplication: () => void;
  userOrgs: any;
  currentUser?: User;
};
class Applications extends Component<
  ApplicationProps,
  { selectedOrgId: string }
> {
  constructor(props: ApplicationProps) {
    super(props);

    this.state = {
      selectedOrgId: "",
    };
  }

  componentDidMount() {
    this.props.getAllApplication();
  }

  public render() {
    const Form: any = OrgInviteUsersForm;
    const DropdownProps = (
      user: User,
      orgName: string,
      orgId: string,
    ): CustomizedDropdownProps => {
      return {
        sections: [
          {
            options: [
              {
                content: orgName,
                disabled: true,
                shouldCloseDropdown: false,
              },
              {
                content: "Organization Settings",
                onSelect: () =>
                  getOnSelectAction(DropdownOnSelectActions.REDIRECT, {
                    path: `/org/${orgId}/settings/general`,
                  }),
              },
              {
                content: "Share",
                onSelect: () =>
                  this.setState({
                    selectedOrgId: orgId,
                  }),
              },
              {
                content: "Members",
                onSelect: () =>
                  getOnSelectAction(DropdownOnSelectActions.REDIRECT, {
                    path: `/org/${orgId}/settings/members`,
                  }),
              },
            ],
          },
        ],
        trigger: {
          content: (
            <DropDownTrigger className="t--org-name">
              {orgName} <Icon icon="chevron-down" color={"black"} />
            </DropDownTrigger>
          ),
          outline: false,
        },
        openDirection: Directions.DOWN,
      };
    };

    return (
      <PageWrapper displayName="Applications">
        <SubHeader
          add={{
            form: CreateOrganizationForm,
            title: "Create Organization",
            formName: CREATE_ORGANIZATION_FORM_NAME,
            formSubmitIntent: "primary",
            isAdding: false,
            formSubmitText: "Create",
            onClick: () => {
              return null;
            },
          }}
          search={{
            placeholder: "Search App Name",
            queryFn: this.props.searchApplications,
          }}
        />
        <PageSectionDivider />
        {this.props.userOrgs &&
          this.props.userOrgs.length !== 0 &&
          this.props.userOrgs.map((organizationObject: any, index: number) => {
            const { organization, applications } = organizationObject;

            return (
              <OrgSection className="t--org-section" key={index}>
                <OrgDropDown>
                  {!isPermitted(
                    organization.userPermissions,
                    PERMISSION_TYPE.MANAGE_ORGANIZATION,
                  ) ? (
                    <OrgName>{organization.name}</OrgName>
                  ) : (
                    <>
                      {this.props.currentUser && (
                        <CustomizedDropdown
                          {...DropdownProps(
                            this.props.currentUser,
                            organization.name,
                            organization.id,
                          )}
                        />
                      )}

                      <StyledDialog
                        canOutsideClickClose={false}
                        canEscapeKeyClose={false}
                        title={`Invite Users to ${organization.name}`}
                        onClose={() =>
                          this.setState({
                            selectedOrgId: "",
                          })
                        }
                        isOpen={this.state.selectedOrgId === organization.id}
                        setMaxWidth
                      >
                        <div className={Classes.DIALOG_BODY}>
                          <Form orgId={organization.id} />
                        </div>
                      </StyledDialog>
                    </>
                  )}
                  {isPermitted(
                    organization.userPermissions,
                    PERMISSION_TYPE.INVITE_USER_TO_ORGANIZATION,
                  ) && (
                    <FormDialogComponent
                      trigger={
                        <Button
                          icon={
                            <HeaderIcons.SHARE
                              color={Colors.WHITE}
                              width={16}
                              height={16}
                            />
                          }
                          text="Share"
                          intent={"primary"}
                          className="t--org-share-btn"
                          filled
                        />
                      }
                      canOutsideClickClose={true}
                      Form={OrgInviteUsersForm}
                      orgId={organization.id}
                      title={`Invite Users to ${organization.name}`}
                    />
                  )}
                </OrgDropDown>
                <ApplicationCardsWrapper key={organization.id}>
                  <FormDialogComponent
                    permissions={organization.userPermissions}
                    permissionRequired={PERMISSION_TYPE.CREATE_APPLICATION}
                    trigger={
                      <PaddingWrapper>
                        <ApplicationAddCardWrapper>
                          <Icon
                            color={"#9F9F9F"}
                            icon="plus"
                            iconSize={17}
                            className="t--create-app-popup"
                          />
                          <CreateNew className="createnew">
                            Create New
                          </CreateNew>
                        </ApplicationAddCardWrapper>
                      </PaddingWrapper>
                    }
                    Form={CreateApplicationForm}
                    orgId={organization.id}
                    title={"Create Application"}
                  />
                  {applications.map((application: any) => {
                    return (
                      application.pages?.length > 0 && (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          delete={this.props.deleteApplication}
                          duplicate={this.props.duplicateApplication}
                        />
                      )
                    );
                  })}
                  <PageSectionDivider />
                </ApplicationCardsWrapper>
              </OrgSection>
            );
          })}
      </PageWrapper>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  applicationList: getApplicationList(state),
  isFetchingApplications: getIsFetchingApplications(state),
  isCreatingApplication: getIsCreatingApplication(state),
  createApplicationError: getCreateApplicationError(state),
  deletingApplication: getIsDeletingApplication(state),
  duplicatingApplication: getIsDuplicatingApplication(state),
  userOrgs: getUserApplicationsOrgsList(state),
  currentUser: getCurrentUser(state),
});

const mapDispatchToProps = (dispatch: any) => ({
  getAllApplication: () =>
    dispatch({ type: ReduxActionTypes.GET_ALL_APPLICATION_INIT }),
  createApplication: (appName: string) => {
    dispatch({
      type: ReduxActionTypes.CREATE_APPLICATION_INIT,
      payload: {
        name: appName,
      },
    });
  },
  searchApplications: (keyword: string) => {
    dispatch({
      type: ReduxActionTypes.SEARCH_APPLICATIONS,
      payload: {
        keyword,
      },
    });
  },
  deleteApplication: (applicationId: string) => {
    if (applicationId && applicationId.length > 0) {
      dispatch({
        type: ReduxActionTypes.DELETE_APPLICATION_INIT,
        payload: {
          applicationId,
        },
      });
    }
  },
  duplicateApplication: (applicationId: string) => {
    dispatch(duplicateApplication(applicationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Applications);
