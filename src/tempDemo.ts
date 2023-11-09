const correct_source_code = `
package co.tide.kos.event.incoming.kafka;

import static org.mockito.Mockito.*;

import au.com.dius.pact.consumer.dsl.PactDslJsonBody;
import au.com.dius.pact.consumer.junit5.PactConsumerTestExt;
import au.com.dius.pact.consumer.junit5.PactTestFor;
import au.com.dius.pact.core.model.OptionalBody;
import au.com.dius.pact.core.model.annotations.Pact;
import au.com.dius.pact.core.model.annotations.PactFolder;
import au.com.dius.pact.core.model.messaging.MessagePact;
import au.com.dius.pact.consumer.junit5.ProviderType;
import co.tide.duedilservice.entities.*;
import co.tide.duedilservice.events.outbound;
import co.tide.kos.business.stucture.service.BusinessStructureService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import au.com.dius.pact.consumer.MessagePactBuilder;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.mockito.Mock;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;

@ExtendWith({PactConsumerTestExt.class, MockitoExtension.class})
@PactTestFor(providerName = "company-details", providerType = ProviderType.ASYNCH)
@PactFolder("pacts")
@TestInstance(Lifecycle.PER_CLASS)
public class CompanyDetailsListenerPactTest {

    @Mock
    private BusinessStructureService businessService;
    @InjectMocks
    private CompanyDetailsListener companyDetailsListener;

    @Pact(consumer = "CompanyDetailsListener")
    public MessagePact createPact(MessagePactBuilder messageBuilder) {
        PactDslJsonBody body = new PactDslJsonBody()
                .stringValue("companyType", "123")
                .booleanValue("isRegistered", true)
                .stringValue("status", "Active")
                .stringValue("registeredName", "ABC LTD")
                .stringValue("incorporationCountry", "GB")
                .object("structureLevelWise")
                .numberValue("1", 1)
                .numberValue("charitableIdentityCount", 1)
                .closeObject()
                .object("address")
                .stringValue("countryCode", "GB")
                .stringValue("premises", "premise")
                .stringValue("thoroughfare", "through_fare")
                .stringValue("dependentLocality", "street_no")
                .stringValue("postTown", "london")
                .stringValue("county", "uk")
                .stringValue("postcode", "HA11BQ");

        return messageBuilder
                .expectsToReceive("a message with company details")
                .withContent(body)
                .toPact();
    }

    @Test
    @PactTestFor(pactMethod = "createPact")
    void testCompanyDetailsListener_succeeded(MessagePact messagePact) throws Exception {
        outbound.Builder testOutbound = outbound.newBuilder();
        OptionalBody msg = messagePact.getMessages().get(0).getContents();
        String msgStr = "";
        if (msg.getValue() != null) {
            msgStr = new String(msg.getValue());
        }
        company_details company_details_decoded = new ObjectMapper().readValue(msgStr, company_details.class);
        System.out.println("company type: " + company_details_decoded.getCompanyType());
        identity identity = co.tide.duedilservice.entities.identity.newBuilder().build();
        metadata metadata = co.tide.duedilservice.entities.metadata.newBuilder()
                .setCreatedAt("06-08-2022")
                .setIsStructureExhausted(true)
                .setFlowId("f24aa017-678d-4f8c-a2b5-ce2e692526c8").build();
        testOutbound.setData(company_details_decoded);
        testOutbound.setIdentity(identity);
        testOutbound.setMetadata(metadata);
        ConsumerRecord<String, outbound> record = new ConsumerRecord<>(
                "test-topic", 0, 0, "test", testOutbound.build());
        companyDetailsListener.consumeCompanyDetails(record);
        // Verify
        verify(businessService, times(1)).handleCompanyDetails(testOutbound.build());
    }
}
`;

export {};
exports.correct_source_code = correct_source_code;
